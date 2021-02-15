import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import {
  gov_covid_summary_query,
  top_covid_spending_query,
} from "src/models/covid/queries.js";

import { breakpoints } from "src/core/breakpoint_defs.js";
import { lang } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { infograph_options_href_template } from "src/infographic/infographic_link.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  util_components,
  Subject,
  ensure_loaded,
  WrappedNivoPie,
} from "../shared.js";

import { AboveTabFootnoteList } from "./covid_common_components.js";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  string_sort_func,
} from "./covid_common_utils.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_expenditures.yaml";

const { CovidMeasure, Dept } = Subject;

const { text_maker, TM } = create_text_maker_component([text1, text2]);
const {
  TabbedContent,
  SpinnerWrapper,
  AlertBanner,
  SmartDisplayTable,
} = util_components;

const client = get_client();

// TODO, would rather not hard code this here, but where else could it live?
const last_refreshed_date = { en: "December 31, 2020", fr: "31 décembre 2020" }[
  lang
];

const panel_key = "covid_expenditures_panel";

const SummaryTab = ({
  args: panel_args,
  data: { top_spending_orgs, top_spending_measures },
}) => {
  const { gov_covid_expenditures_in_year } = panel_args;

  const {
    name: top_spending_org_name,
    spending: top_spending_org_amount,
  } = _.first(top_spending_orgs);
  const {
    name: top_spending_measure_name,
    spending: top_spending_measure_amount,
  } = _.first(top_spending_measures);
  const text_args = {
    ...panel_args,
    top_spending_org_name,
    top_spending_org_amount,
    top_spending_measure_name,
    top_spending_measure_amount,
  };

  const SummaryTabPie = ({ data, other_items_label, reverse_layout }) => (
    <WrappedNivoPie
      data={_.chain(data)
        .map(({ name, spending }) => ({
          id: name,
          label: name,
          value: spending,
        }))
        .thru((pie_data) => [
          ...pie_data,
          {
            id: "other",
            label: other_items_label,
            value:
              gov_covid_expenditures_in_year -
              _.reduce(pie_data, (memo, { value }) => memo + value, 0),
          },
        ])
        .value()}
      display_horizontal={true}
      sort_legend={false}
      graph_height={"300px"}
      reverse_layout={reverse_layout}
    />
  );

  return (
    <div className="frow middle-xs">
      <TM
        k={`covid_expenditures_overview_tab_text`}
        args={text_args}
        className="medium-panel-text fcol-xs-12"
      />
      <div className="fcol-sm-12">
        <TM k={`covid_top_spending_orgs`} el={"h3"} />
        <SummaryTabPie
          data={top_spending_orgs}
          other_items_label={text_maker("covid_all_other_orgs")}
          reverse_layout={false}
        />
      </div>
      <div className="fcol-xs-12">
        <TM k={`covid_top_spending_measures`} el={"h3"} />
        <MediaQuery minWidth={breakpoints.minMediumDevice}>
          {(matches) => (
            <SummaryTabPie
              data={top_spending_measures}
              other_items_label={text_maker("covid_all_other_measures")}
              reverse_layout={!!matches}
            />
          )}
        </MediaQuery>
      </div>
    </div>
  );
};

const get_expenditures_by_index = (exp_data, index_key) =>
  _.chain(exp_data)
    .map(index_key)
    .uniq()
    .map((index_value) => {
      const index = { [index_key]: index_value };

      const { vote, stat } = _.find(exp_data, index) || { vote: 0, stat: 0 };

      return {
        ...index,
        vote,
        stat,
        total_exp: vote + stat,
      };
    })
    .thru((rows) => {
      const total = _.reduce(
        rows,
        (memo, { total_exp }) => memo + total_exp,
        0
      );

      return _.map(rows, (row) => ({
        ...row,
        share: row.total_exp / total || 0,
      }));
    })
    .value();

const get_common_column_configs = (show_vote_stat) => ({
  vote: {
    index: 2,
    header: text_maker(`covid_expenditures_voted`),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: show_vote_stat,
  },
  stat: {
    index: 3,
    header: text_maker(`covid_expenditures_stat`),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: show_vote_stat,
  },
  total_exp: {
    index: 4,
    header: text_maker(`covid_expenditures`),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: !show_vote_stat,
  },
  share: {
    index: 5,
    header: text_maker(`covid_share_of_total`),
    is_searchable: false,
    is_summable: false,
    formatter: "percentage2",
  },
});

const ByDepartmentTab = wrap_with_vote_stat_controls(
  ({
    show_vote_stat,
    ToggleVoteStat,
    args: panel_args,
    data: { covid_expenditures },
  }) => {
    const rows = get_expenditures_by_index(covid_expenditures, "org_id");

    const column_configs = {
      org_id: {
        index: 0,
        header: text_maker("org"),
        is_searchable: true,
        formatter: (org_id) => {
          const org = Dept.lookup(org_id);

          return (
            <a
              href={infograph_options_href_template(org, "covid", {
                panel_key,
              })}
            >
              {org.name}
            </a>
          );
        },
        raw_formatter: (org_id) => Dept.lookup(org_id).name,
        sort_func: (org_id_a, org_id_b) => {
          const org_a = Dept.lookup(org_id_a);
          const org_b = Dept.lookup(org_id_b);
          return string_sort_func(org_a.name, org_b.name);
        },
      },
      ...get_common_column_configs(show_vote_stat),
    };

    const {
      org_id: largest_dept_id,
      total_exp: largest_dept_exp,
      share: largest_dept_share,
    } = _.chain(rows).sortBy("total_exp").last().value();

    return (
      <Fragment>
        <TM
          k={"covid_expenditures_department_tab_text"}
          args={{
            ...panel_args,
            largest_dept_name: Dept.lookup(largest_dept_id).name,
            largest_dept_exp,
            largest_dept_share,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <SmartDisplayTable
          data={rows}
          column_configs={column_configs}
          table_name={text_maker("by_department_tab_label")}
          disable_column_select={true}
        />
      </Fragment>
    );
  }
);

const ByMeasureTab = wrap_with_vote_stat_controls(
  ({
    show_vote_stat,
    ToggleVoteStat,
    args: panel_args,
    data: { covid_expenditures },
  }) => {
    const rows_with_measure_names = _.chain(
      get_expenditures_by_index(covid_expenditures, "measure_id")
    )
      .map(({ measure_id, ...row }) => ({
        ...row,
        measure_name: CovidMeasure.lookup(measure_id).name,
      }))
      .value();

    const column_configs = {
      measure_name: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
        sort_func: (name_a, name_b) => string_sort_func(name_a, name_b),
      },
      ...get_common_column_configs(show_vote_stat),
    };

    const {
      measure_name: largest_measure_name,
      total_exp: largest_measure_exp,
      share: largest_measure_share,
    } = _.chain(rows_with_measure_names).sortBy("total_exp").last().value();

    const subject_level = panel_args.subject.level;
    const text_args = {
      ...panel_args,
      largest_measure_name,
      largest_measure_exp,
      largest_measure_share,
      ...(subject_level === "dept" && {
        dept_covid_expenditures_in_year: _.reduce(
          covid_expenditures,
          (memo, { vote, stat }) => memo + vote + stat,
          0
        ),
      }),
    };
    return (
      <Fragment>
        {subject_level === "dept"}
        <TM
          k={`covid_expenditures_measure_tab_text_${subject_level}`}
          args={text_args}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <SmartDisplayTable
          data={rows_with_measure_names}
          column_configs={column_configs}
          table_name={text_maker("by_measure_tab_label")}
          disable_column_select={true}
        />
      </Fragment>
    );
  }
);

const tab_content_configs = [
  {
    key: "summary",
    levels: ["gov"],
    label: text_maker("summary_tab_label"),
    load_data: (panel_args) =>
      client
        .query({
          query: top_covid_spending_query,
          variables: {
            lang: lang,
            _query_name: "top_covid_spending_query",
          },
        })
        .then(
          ({
            data: {
              root: {
                gov: {
                  covid_summary: { top_spending_orgs, top_spending_measures },
                },
              },
            },
          }) => ({
            top_spending_orgs: _.map(
              top_spending_orgs,
              ({ name, covid_summary: { covid_expenditures } }) => ({
                name,
                spending: _.reduce(
                  covid_expenditures,
                  (memo, { vote, stat }) => memo + vote + stat,
                  0
                ),
              })
            ),
            top_spending_measures: _.map(
              top_spending_measures,
              ({ name, covid_expenditures }) => ({
                name,
                spending: _.reduce(
                  covid_expenditures,
                  (memo, { vote, stat }) => memo + vote + stat,
                  0
                ),
              })
            ),
          })
        ),
    TabContent: SummaryTab,
  },
  {
    key: "department",
    levels: ["gov"],
    label: text_maker("by_department_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({
        covid_expenditures: true,
        subject,
      }).then(() => ({
        covid_expenditures: CovidMeasure.get_all_data_by_org("expenditures"),
      })),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    levels: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({
        covid_expenditures: true,
        subject,
      }).then(() => ({
        covid_expenditures:
          subject.level === "gov"
            ? CovidMeasure.gov_data_by_measure("expenditures")
            : CovidMeasure.org_lookup_data_by_measure(
                "expenditures",
                subject.id
              ),
      })),
    TabContent: ByMeasureTab,
  },
];

class CovidExpendituresPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    client
      .query({
        query: gov_covid_summary_query,
        variables: {
          lang: lang,
          _query_name: "gov_covid_summary_query",
        },
      })
      .then(
        ({
          data: {
            root: {
              gov: {
                covid_summary: { covid_expenditures },
              },
            },
          },
        }) => {
          this.setState({
            gov_covid_expenditures_in_year: _.reduce(
              covid_expenditures,
              (memo, { vote, stat }) => memo + vote + stat,
              0
            ),
            loading: false,
          });
        }
      );
  }
  render() {
    const { loading, gov_covid_expenditures_in_year } = this.state;
    const { panel_args } = this.props;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        last_refreshed_date,
        gov_covid_expenditures_in_year,
      };
      const {
        tab_keys,
        tab_labels,
        tab_pane_contents,
      } = get_tabbed_content_props(tab_content_configs, extended_panel_args);

      return (
        <Fragment>
          <div className="medium-panel-text text">
            <AboveTabFootnoteList subject={panel_args.subject}>
              <TM k="covid_expenditures_above_tab_footnote_list" />
            </AboveTabFootnoteList>
          </div>
          {tab_keys.length === 1 && (
            <Fragment>
              <div className="panel-separator" />
              {tab_pane_contents?.[tab_keys[0]]}
            </Fragment>
          )}
          {tab_keys.length > 1 && (
            <TabbedContent {...{ tab_keys, tab_labels, tab_pane_contents }} />
          )}
        </Fragment>
      );
    }
  }
}

export const declare_covid_expenditures_panel = () =>
  declare_panel({
    panel_key,
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_has_covid_response: level_name === "dept",
      initial_queries: {
        gov_covid_summary_query,
        ...(level_name === "gov" && { top_covid_spending_query }),
      },
      footnotes: false,
      source: (subject) => [],
      calculate: (subject, options) => {
        if (level_name === "gov") {
          return true;
        } else {
          return subject.has_data("covid_response")?.has_expenditures;
        }
      },
      render: ({
        calculations: { panel_args, subject },
        footnotes,
        sources,
      }) => (
        <InfographicPanel
          title={text_maker("covid_expenditures_panel_title")}
          {...{
            sources,
            footnotes,
          }}
        >
          <AlertBanner banner_class="danger">
            {"Real (but non-final) data. For development purposes only!"}
          </AlertBanner>
          <CovidExpendituresPanel panel_args={{ ...panel_args, subject }} />
        </InfographicPanel>
      ),
    }),
  });
