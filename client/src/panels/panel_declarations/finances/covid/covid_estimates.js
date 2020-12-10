import _ from "lodash";
import React, { Fragment } from "react";

import {
  Subject,
  util_components,
  create_text_maker_component,
  InfographicPanel,
  ensure_loaded,
  declare_panel,
  WrappedNivoBar,
  StandardLegend,
  infograph_options_href_template,
  businessConstants,
} from "src/panels/panel_declarations/shared.js";

import {
  gov_covid_estimates_summary_query,
  org_covid_estimates_summary_query,
} from "src/models/covid/queries.js";

import { textColor } from "src/core/color_defs.js";
import { infobase_colors } from "src/core/color_schemes.js";
import { lang, is_a11y_mode } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import text from "./covid_estimates.yaml";

const { CovidMeasure, Gov, Dept } = Subject;

const { estimates_docs } = businessConstants;

const { TabbedContent, SpinnerWrapper, SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([text]);

const client = get_client();

const get_est_doc_name = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][lang] : "";
const get_est_doc_order = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc].order : 9999;
const est_doc_sort_func = (est_doc_a, est_doc_b) => {
  const order_a = get_est_doc_order(est_doc_a);
  const order_b = get_est_doc_order(est_doc_b);

  if (order_a < order_b) {
    return -1;
  } else if (order_a > order_b) {
    return 1;
  }
  return 0;
};

const get_plain_string = (string) =>
  _.chain(string).deburr().lowerCase().value();
const string_sort_func = (a, b) => {
  const plain_a = get_plain_string(a);
  const plain_b = get_plain_string(b);

  if (plain_a < plain_b) {
    return -1;
  } else if (plain_a > plain_b) {
    return 1;
  }
  return 0;
};

const SummaryTab = ({ panel_args, data: covid_estimates_summary }) => {
  const { subject } = panel_args;

  const colors = infobase_colors();

  const graph_data = _.chain(covid_estimates_summary)
    .map(({ est_doc, stat, vote }) => ({
      doc_name: get_est_doc_name(est_doc),
      [text_maker("covid_estimates_stat")]: stat,
      [text_maker("covid_estimates_voted")]: vote,
    }))
    .value();

  const graph_keys = _.chain(graph_data)
    .first()
    .omit("doc_name")
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
      indexBy="doc_name"
      colors={(d) => colors(d.id)}
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
    const est_doc_summary_stats = _.map(
      covid_estimates_summary,
      ({ est_doc, vote, stat }) => [get_est_doc_name(est_doc), vote + stat]
    );

    if (subject.level === "gov") {
      const { gov_covid_auth_in_year, gov_total_auth_in_year } = panel_args;
      return {
        est_doc_summary_stats,
        covid_auth_pct_of_gov_auth:
          gov_covid_auth_in_year / gov_total_auth_in_year,
      };
    } else {
      const { gov_total_auth_in_year } = panel_args;

      const dept_covid_auth_in_year = _.reduce(
        covid_estimates_summary,
        (memo, { stat, vote }) => memo + vote + stat,
        0
      );

      return {
        est_doc_summary_stats,
        dept_covid_auth_in_year,
        covid_auth_pct_of_gov_auth:
          dept_covid_auth_in_year / gov_total_auth_in_year,
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
        <TM k={"covid_estimates_by_doc"} args={panel_args} />
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

const common_column_configs = {
  est_doc: {
    index: 1,
    header: text_maker("covid_estimates_estimates_doc"),
    is_searchable: true,
    formatter: get_est_doc_name,
    raw_formatter: get_est_doc_name,
    sort_func: est_doc_sort_func,
  },
  stat: {
    index: 2,
    header: text_maker("covid_estimates_stat"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
  },
  vote: {
    index: 3,
    header: text_maker("covid_estimates_voted"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
  },
};
const ByDepartmentTab = ({ data: estimates_by_covid_measure }) => {
  // This should be either a getter on CovidMeasure or a common util function somewhere...
  const covid_estimates_by_department = _.chain(estimates_by_covid_measure)
    .flatMap("estimates")
    .groupBy("org_id")
    .flatMap((org_group, org_id) =>
      _.chain(org_group)
        .groupBy("est_doc")
        .flatMap((doc_group, est_doc) => ({
          org_id,
          org: Dept.lookup(org_id),
          est_doc,
          ..._.reduce(
            doc_group,
            (memo, row) => ({
              stat: memo.stat + row.stat,
              vote: memo.vote + row.vote,
            }),
            { stat: 0, vote: 0 }
          ),
        }))
        .value()
    )
    .value();

  // pre-sort by est doc, so presentation consistent when sorting by other col
  const pre_sorted_dept_estimates = _.sortBy(
    covid_estimates_by_department,
    ({ est_doc }) => get_est_doc_order(est_doc)
  );

  const column_configs = {
    org: {
      index: 0,
      header: text_maker("department"),
      is_searchable: true,
      formatter: (org) => (
        <a
          href={infograph_options_href_template(org, "financial", {
            panel_key: "covid_estimates_panel",
          })}
        >
          {org.name}
        </a>
      ),
      raw_formatter: (org) => org.name,
      sort_func: (org_a, org_b) => string_sort_func(org_a.name, org_b.name),
    },
    ...common_column_configs,
  };

  const [largest_dept_id, largest_dept_auth] = _.chain(
    pre_sorted_dept_estimates
  )
    .groupBy("org_id")
    .mapValues((covid_estimates) =>
      _.reduce(covid_estimates, (memo, { vote, stat }) => memo + vote + stat, 0)
    )
    .toPairs()
    .sortBy(([org_id, auth_total]) => auth_total)
    .last()
    .value();

  return (
    <Fragment>
      <TM
        k="covid_estimates_department_tab_text"
        args={{
          largest_dept_name: Dept.lookup(largest_dept_id).name,
          largest_dept_auth,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(pre_sorted_dept_estimates, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("covid_estimates_department_tab_label")}
      />
    </Fragment>
  );
};

//const get_initiative_rows = (subject) => {
//  const initiatives =
//    subject.level === "gov"
//      ? CovidInitiatives.get_all()
//      : CovidInitiatives.org_lookup(subject.id);
//
//  // TODO: not future safe, ignoring years here, so would be rolling-up cross-year in 2021-22
//  return _.flatMap(initiatives, ({ name, estimates }) =>
//    _.chain(estimates)
//      .thru((estimates) =>
//        subject.level === "gov"
//          ? estimates
//          : _.filter(estimates, ({ org_id }) => org_id === subject.id)
//      )
//      .groupBy("est_doc")
//      .map((grouped_estimates, est_doc) =>
//        _.reduce(
//          grouped_estimates,
//          (memo, { stat, vote }) => ({
//            ...memo,
//            stat: memo.stat + stat,
//            vote: memo.vote + vote,
//          }),
//          {
//            initiative_name: name,
//            est_doc,
//            stat: 0,
//            vote: 0,
//          }
//        )
//      )
//      .sortBy(({ est_doc }) => get_est_doc_order(est_doc)) // pre-sort by est doc, so presentation consistent when sorting by other col
//      .value()
//  );
//};
//const ByInitiativeTab = ({ panel_args }) => {
//  const { subject } = panel_args;
//
//  const initiative_rows = get_initiative_rows(subject);
//
//  const column_configs = {
//    initiative_name: {
//      index: 0,
//      header: text_maker("covid_initiative"),
//      is_searchable: true,
//      sort_func: string_sort_func,
//    },
//    ...common_column_configs,
//  };
//
//  const [largest_initiative_name, largest_initiative_auth] = _.chain(
//    initiative_rows
//  )
//    .groupBy("initiative_name")
//    .mapValues((row) =>
//      _.reduce(row, (memo, { vote, stat }) => memo + vote + stat, 0)
//    )
//    .toPairs()
//    .sortBy(([initiative_name, auth_total]) => auth_total)
//    .last()
//    .value();
//
//  return (
//    <Fragment>
//      <TM
//        k="covid_estimates_initiative_tab_text"
//        args={{
//          largest_initiative_name,
//          largest_initiative_auth,
//        }}
//        className="medium-panel-text"
//      />
//      <SmartDisplayTable
//        data={_.map(initiative_rows, (row) =>
//          _.pick(row, _.keys(column_configs))
//        )}
//        column_configs={column_configs}
//        table_name={text_maker("covid_estimates_initiative_tab_label")}
//      />
//    </Fragment>
//  );
//};

class TabLoadingWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
    };
  }
  componentDidMount() {
    const { panel_args, load_data } = this.props;

    load_data(panel_args).then((data) =>
      this.setState({
        data,
        loading: false,
      })
    );
  }
  render() {
    const { panel_args, TabContent } = this.props;

    const { loading, data } = this.state;

    if (loading) {
      return (
        <div
          style={{
            position: "relative",
            height: "80px",
            marginBottom: "-10px",
          }}
        >
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      return <TabContent panel_args={panel_args} data={data} />;
    }
  }
}

const tab_content_configs = [
  {
    key: "summary",
    label: text_maker("covid_estimates_summary_tab_label"),
    load_data: (panel_args) => {
      const { subject } = panel_args;

      const { query, variables, response_accessor } = (() => {
        if (subject.level === "dept") {
          return {
            query: org_covid_estimates_summary_query,
            variables: {
              lang: window.lang,
              id: subject.id,
              _query_name: "org_covid_estimates_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.org.covid_estimates_summary"),
          };
        } else {
          return {
            query: gov_covid_estimates_summary_query,
            variables: {
              lang: window.lang,
              _query_name: "gov_covid_estimates_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.gov.covid_estimates_summary"),
          };
        }
      })();

      return client.query({ query, variables }).then(response_accessor);
    },
    TabContent: SummaryTab,
    levels: ["gov", "dept"],
  },
  {
    key: "department",
    label: text_maker("covid_estimates_department_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({ covid_estimates: true, subject }).then(() =>
        CovidMeasure.get_all()
      ),
    TabContent: ByDepartmentTab,
    levels: ["gov"],
  },
  //{
  //  key: "initiative",
  //  label: text_maker("covid_estimates_initiative_tab_label"),
  //  TabContent: ByInitiativeTab,
  //  levels: ["gov", "dept"],
  //},
];
const get_tabbed_content_props = (panel_args) => {
  const configs_for_level = _.filter(tab_content_configs, ({ levels }) =>
    _.includes(levels, panel_args.subject.level)
  );

  return {
    tab_keys: _.map(configs_for_level, "key"),
    tab_labels: _.chain(configs_for_level)
      .map(({ key, label }) => [key, label])
      .fromPairs()
      .value(),
    tab_pane_contents: _.chain(configs_for_level)
      .map(({ key, load_data, TabContent }) => [
        key,
        <TabLoadingWrapper
          panel_args={panel_args}
          load_data={load_data}
          TabContent={TabContent}
          key={key}
        />,
      ])
      .fromPairs()
      .value(),
  };
};

class CovidEstimatesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      gov_covid_auth_in_year: null,
      covid_estimates_summary: null,
    };
  }
  componentDidMount() {
    client
      .query({
        query: gov_covid_estimates_summary_query,
        variables: {
          lang: window.lang,
          _query_name: "gov_covid_estimates_summary_query",
        },
      })
      .then(({ data: { root: { gov: { covid_estimates_summary } } } }) =>
        this.setState({
          gov_covid_auth_in_year: _.reduce(
            covid_estimates_summary,
            (memo, { vote, stat }) => memo + vote + stat,
            0
          ),
          loading: false,
        })
      );
  }
  render() {
    const { loading, gov_covid_auth_in_year } = this.state;
    const { panel_args } = this.props;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        gov_covid_auth_in_year,
      };

      const tabbed_content_props = get_tabbed_content_props(
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="frow">
            <div className="fcol-md-12 fcol-xs-12 medium-panel-text text">
              <TM
                k={"covid_estimates_above_tab_text_gov"}
                args={extended_panel_args}
              />
              <TM
                k={"covid_estimates_above_tab_footnote_title"}
                className="bold"
                el="span"
              />
              <TM
                k={"covid_estimates_above_tab_footnote_list"}
                style={{ lineHeight: "normal" }}
              />
            </div>
          </div>
          <TabbedContent {...tabbed_content_props} />
        </Fragment>
      );
    }
  }
}

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key: "covid_estimates_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_has_covid_response: level_name === "dept",
      initial_queries: {
        gov_covid_estimates_summary_query,
        ...(level_name === "dept" && { org_covid_estimates_summary_query }),
      },
      footnotes: ["COVID", "COVID_AUTH"],
      depends_on: ["orgVoteStatEstimates"],
      source: (subject) => [],
      calculate: function (subject, options) {
        if (level_name === "dept" && !subject.has_data("covid_response")) {
          return false;
        }

        const { orgVoteStatEstimates } = this.tables;
        const gov_total_auth_in_year = orgVoteStatEstimates
          .q(Gov)
          .sum("{{est_last_year}}_estimates");

        const common = {
          subject,
          gov_total_auth_in_year,
        };

        if (level_name === "gov") {
          return common;
        } else {
          const dept_tabled_est_last_year = orgVoteStatEstimates
            .q(subject)
            .sum("{{est_last_year}}_estimates");

          return {
            ...common,
            dept_tabled_est_last_year,
          };
        }
      },
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args } = calculations;

        return (
          <InfographicPanel
            allowOverflow={true}
            title={text_maker("covid_estimates_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            <CovidEstimatesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
