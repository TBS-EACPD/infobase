import _ from "lodash";
import React, { Fragment } from "react";

import {
  Subject,
  util_components,
  create_text_maker_component,
  InfographicPanel,
  ensure_loaded,
  declare_panel,
  StandardLegend,
  WrappedNivoBar,
} from "src/panels/panel_declarations/shared.js";

import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "src/models/covid/queries.js";

import { textColor } from "src/core/color_defs.js";
import { infobase_colors } from "src/core/color_schemes.js";

import { lang, is_a11y_mode } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { infograph_options_href_template } from "src/infographic/infographic_link.js";

import { AboveTabFootnoteList } from "./covid_common_components.js";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  get_est_doc_name,
  get_est_doc_order,
  get_est_doc_glossary_key,
  string_sort_func,
} from "./covid_common_utils.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_estimates.yaml";

const { CovidMeasure, Dept } = Subject;

const {
  TabbedContent,
  SpinnerWrapper,
  AlertBanner,
  SmartDisplayTable,
} = util_components;

const { text_maker, TM } = create_text_maker_component([text1, text2]);

const client = get_client();

const colors = infobase_colors();

const panel_key = "covid_estimates_panel";

const SummaryTab = ({ args: panel_args, data }) => {
  const { subject } = panel_args;

  const graph_index_key = "index_key";

  const graph_data = _.chain(data)
    .map((row) => ({
      [graph_index_key]: get_est_doc_name(row.est_doc),
      [text_maker(`covid_estimates_stat`)]: row.stat,
      [text_maker(`covid_estimates_vote`)]: row.vote,
    }))
    .value();

  const graph_keys = _.chain(graph_data)
    .first()
    .omit(graph_index_key)
    .keys()
    .value();

  const legend_items = _.map(graph_keys, (key) => ({
    id: key,
    label: key,
    color: colors(key),
  }));

  const graph_content = (
    <WrappedNivoBar
      data={graph_data}
      keys={graph_keys}
      indexBy={graph_index_key}
      colorBy={(d) => colors(d.id)}
      margin={{
        top: 50,
        right: 40,
        bottom: 120,
        left: 40,
      }}
      bttm_axis={{
        format: (d) => (_.words(d).length > 3 ? d.substring(0, 20) + "..." : d),
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      }}
      graph_height="450px"
      enableGridX={false}
      remove_left_axis={true}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: textColor,
              fontWeight: "550",
            },
          },
        },
      }}
    />
  );

  const additional_text_args = (() => {
    const index_summary_stats = _.map(data, (row) => [
      get_est_doc_name(row.est_doc),
      get_est_doc_glossary_key(row.est_doc),
      row.vote + row.stat,
    ]);

    if (subject.level === "gov") {
      return {
        index_summary_stats,
        covid_est_pct_of_all_est:
          panel_args[`gov_covid_estimates_in_year`] /
          panel_args[`gov_total_estimates_in_year`],
      };
    } else {
      const dept_covid_estimates_in_year = _.reduce(
        data,
        (memo, { stat, vote }) => memo + vote + stat,
        0
      );

      return {
        index_summary_stats,
        dept_covid_estimates_in_year,
      };
    }
  })();

  return (
    <div className="frow middle-xs">
      <div className="fcol-xs-12 fcol-md-6 medium-panel-text">
        <TM
          k={`covid_estimates_summary_text_${subject.level}`}
          args={{ ...panel_args, ...additional_text_args }}
        />
        <TM
          k={"covid_estimates_by_index_key"}
          args={{ ...panel_args, ...additional_text_args }}
        />
      </div>
      <div className="fcol-xs-12 fcol-md-6">
        {!is_a11y_mode && (
          <StandardLegend
            items={legend_items}
            isHorizontal={true}
            LegendCheckBoxProps={{ isSolidBox: true }}
          />
        )}
        {graph_content}
      </div>
    </div>
  );
};

const vs_type_ordering = { vote: 1, stat: 2, both: 3 };
const get_vs_type_name = (vs_type) =>
  _.includes(["vote", "stat"], vs_type)
    ? text_maker(`covid_estimates_${vs_type}`)
    : "";

const get_common_column_configs = (show_vote_stat, est_docs) => ({
  vs_type: {
    index: 1,
    header: text_maker(`vote_or_stat`),
    is_searchable: true,
    is_summable: false,
    formatter: get_vs_type_name,
    raw_formatter: get_vs_type_name,
    sort_func: (type_a, type_b) => {
      const order_a = vs_type_ordering[type_a];
      const order_b = vs_type_ordering[type_b];

      if (order_a < order_b) {
        return -1;
      } else if (order_a > order_b) {
        return 1;
      }
      return 0;
    },
    initial_visible: show_vote_stat,
  },
  ..._.chain(est_docs)
    .sortBy(get_est_doc_order)
    .map((est_doc, ix) => [
      est_doc,
      {
        index: 2 + ix,
        header: get_est_doc_name(est_doc),
        is_searchable: false,
        is_summable: true,
        formatter: "compact2",
      },
    ])
    .fromPairs()
    .value(),
  total: {
    index: 1 + est_docs.length,
    header: text_maker("total"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: est_docs.length > 1,
  },
});

const ByDepartmentTab = wrap_with_vote_stat_controls(
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const est_docs = _.chain(data).map("est_doc").uniq().value();

    const pre_sorted_dept_data = _.chain(data)
      .flatMap(({ vote, stat, ...row_base }) => {
        if (show_vote_stat) {
          return [
            { ...row_base, vs_type: "vote", value: vote },
            { ...row_base, vs_type: "stat", value: stat },
          ];
        } else {
          return [{ ...row_base, vs_type: "both", value: vote + stat }];
        }
      })
      .groupBy("org_id")
      .flatMap((rows, org_id) =>
        _.chain(rows)
          .groupBy("vs_type")
          .flatMap((vs_group, vs_type) => ({
            org_id,
            vs_type,
            ..._.chain(est_docs)
              .map((est_doc) => [
                est_doc,
                _.chain(vs_group).find({ est_doc }).get("value", 0).value(),
              ])
              .fromPairs()
              .value(),
            total: _.reduce(vs_group, (memo, { value }) => memo + value, 0),
          }))
          .value()
      )
      .filter("total")
      .sortBy(({ vs_type }) => vs_type_ordering[vs_type]) // pre-sort by secondary index, for consistency
      .value();

    const column_configs = {
      org_id: {
        index: 0,
        header: text_maker("department"),
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
      ...get_common_column_configs(show_vote_stat, est_docs),
    };

    const [largest_dept_id, largest_dept_auth] = _.chain(data)
      .groupBy("org_id")
      .mapValues((data) =>
        _.reduce(data, (memo, { vote, stat }) => memo + vote + stat, 0)
      )
      .toPairs()
      .sortBy(([org_id, total]) => total)
      .last()
      .value();

    return (
      <Fragment>
        <TM
          k={"covid_estimates_department_tab_text"}
          args={{
            ...panel_args,
            largest_dept_name: Dept.lookup(largest_dept_id).name,
            largest_dept_auth,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <SmartDisplayTable
          data={_.map(pre_sorted_dept_data, (row) =>
            _.pick(row, _.keys(column_configs))
          )}
          column_configs={column_configs}
          table_name={text_maker("by_department_tab_label")}
          disable_column_select={true}
        />
      </Fragment>
    );
  }
);

const ByMeasureTab = wrap_with_vote_stat_controls(
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const est_docs = _.chain(data).map("est_doc").uniq().value();

    const pre_sorted_data = _.chain(data)
      .flatMap(({ vote, stat, ...row_base }) => {
        if (show_vote_stat) {
          return [
            { ...row_base, vs_type: "vote", value: vote },
            { ...row_base, vs_type: "stat", value: stat },
          ];
        } else {
          return [{ ...row_base, vs_type: "both", value: vote + stat }];
        }
      })
      .groupBy("measure_id")
      .flatMap((rows, measure_id) =>
        _.chain(rows)
          .groupBy("vs_type")
          .flatMap((vs_group, vs_type) => ({
            measure_name: CovidMeasure.lookup(measure_id).name,
            vs_type,
            ..._.chain(est_docs)
              .map((est_doc) => [
                est_doc,
                _.chain(vs_group).find({ est_doc }).get("value", 0).value(),
              ])
              .fromPairs()
              .value(),
            total: _.reduce(vs_group, (memo, { value }) => memo + value, 0),
          }))
          .value()
      )
      .filter("total")
      .sortBy(({ vs_type }) => vs_type_ordering[vs_type]) // pre-sort by secondary index, for consistency
      .value();

    const column_configs = {
      measure_name: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
        sort_func: (name_a, name_b) => string_sort_func(name_a, name_b),
      },
      ...get_common_column_configs(show_vote_stat, est_docs),
    };

    const [largest_measure_name, largest_measure_auth] = _.chain(
      pre_sorted_data
    )
      .groupBy("measure_name")
      .map((rows, measure_name) => [
        measure_name,
        _.reduce(rows, (memo, { total }) => memo + total, 0),
      ])
      .sortBy(([_measure_name, total]) => total)
      .last()
      .value();

    return (
      <Fragment>
        <TM
          k={"covid_estimates_measure_tab_text"}
          args={{
            ...panel_args,
            largest_measure_name,
            largest_measure_auth,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <SmartDisplayTable
          data={_.map(pre_sorted_data, (row) =>
            _.pick(row, _.keys(column_configs))
          )}
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
    levels: ["gov", "dept"],
    label: text_maker("summary_tab_label"),
    load_data: (panel_args) => {
      const { subject } = panel_args;

      const { query, variables, response_accessor } = (() => {
        if (subject.level === "dept") {
          return {
            query: org_covid_summary_query,
            variables: {
              lang: lang,
              id: subject.id,
              _query_name: "org_covid_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.org.covid_summary.covid_estimates"),
          };
        } else {
          return {
            query: gov_covid_summary_query,
            variables: {
              lang: lang,
              _query_name: "gov_covid_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.gov.covid_summary.covid_estimates"),
          };
        }
      })();

      return client.query({ query, variables }).then(response_accessor);
    },
    TabContent: SummaryTab,
  },
  {
    key: "department",
    levels: ["gov"],
    label: text_maker("by_department_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({ covid_estimates: true, subject }).then(() =>
        CovidMeasure.get_all_data_by_org("estimates", "est_doc")
      ),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    levels: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({ covid_estimates: true, subject }).then(() =>
        subject.level === "gov"
          ? CovidMeasure.gov_data_by_measure("estimates", "est_doc")
          : CovidMeasure.org_lookup_data_by_measure("estimates", subject.id)
      ),
    TabContent: ByMeasureTab,
  },
];

class CovidEstimatesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      gov_covid_estimates_in_year: null,
      covid_summary: null,
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
                covid_summary: { covid_estimates },
              },
            },
          },
        }) =>
          this.setState({
            gov_covid_estimates_in_year: _.reduce(
              covid_estimates,
              (memo, { vote, stat }) => memo + vote + stat,
              0
            ),
            loading: false,
          })
      );
  }
  render() {
    const { loading, gov_covid_estimates_in_year } = this.state;
    const { panel_args } = this.props;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        gov_covid_estimates_in_year,
      };

      const tabbed_content_props = get_tabbed_content_props(
        tab_content_configs,
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="medium-panel-text text">
            <AboveTabFootnoteList>
              <TM k="covid_estimates_above_tab_footnote_list" />
            </AboveTabFootnoteList>
          </div>
          <TabbedContent {...tabbed_content_props} />
        </Fragment>
      );
    }
  }
}

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key,
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_has_covid_response: level_name === "dept",
      initial_queries: {
        gov_covid_summary_query,
        ...(level_name === "dept" && { org_covid_summary_query }),
      },
      footnotes: ["COVID", "COVID_AUTH"],
      depends_on: [],
      source: (subject) => [],
      calculate: function (subject, options) {
        if (
          level_name === "dept" &&
          !subject.has_data("covid_response")?.has_estimates
        ) {
          return false;
        }

        return {
          subject,
        };
      },
      render: ({ calculations: { panel_args }, footnotes, sources }) => (
        <InfographicPanel
          allowOverflow={true}
          title={text_maker("covid_estimates_panel_title")}
          {...{
            sources,
            footnotes,
          }}
        >
          <AlertBanner banner_class="danger">
            {
              "Real (but non-final) data for supps A and B. Supps C values are totally fake. For development purposes only!"
            }
          </AlertBanner>
          <CovidEstimatesPanel panel_args={panel_args} />
        </InfographicPanel>
      ),
    }),
  });
