import _ from "lodash";
import React, { Fragment } from "react";

import { textColor } from "src/core/color_defs.js";

import {
  lang,
  is_a11y_mode,
  infobase_colors,
} from "src/app_bootstrap/globals.js";

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
} from "../../shared.js";

import text from "./covid_estimates.yaml";

const { CovidEstimates, CovidInitiatives, Gov, Dept } = Subject;

const { estimates_docs } = businessConstants;

const { TabbedContent, SpinnerWrapper, SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([text]);

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

const SummaryTab = ({ panel_args }) => {
  const { covid_estimates_data, subject } = panel_args;

  const colors = infobase_colors();

  const graph_data = _.chain(covid_estimates_data)
    .map(({ doc_name, stat, vote }) => ({
      doc_name,
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

  const level_specific_text_args = (() => {
    if (subject.level === "gov") {
      const { gov_covid_auth_in_year, gov_total_auth_in_year } = panel_args;
      return {
        covid_auth_pct_of_gov_auth:
          gov_covid_auth_in_year / gov_total_auth_in_year,
      };
    } else {
      const { gov_total_auth_in_year } = panel_args;

      const dept_covid_auth_in_year = _.reduce(
        covid_estimates_data,
        (memo, { stat, vote }) => memo + vote + stat,
        0
      );

      return {
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
          args={{ ...panel_args, ...level_specific_text_args }}
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
const ByDepartmentTab = ({ panel_args }) => {
  // pre-sort by est doc, so presentation consistent when sorting by other col
  const pre_sorted_dept_estimates = _.sortBy(
    CovidEstimates.get_all(),
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

const get_initiative_rows = (subject) => {
  const initiatives =
    subject.level === "gov"
      ? CovidInitiatives.get_all()
      : CovidInitiatives.org_lookup(subject.id);

  // TODO: not future safe, ignoring years here, so would be rolling-up cross-year in 2021-22
  return _.flatMap(initiatives, ({ name, estimates }) =>
    _.chain(estimates)
      .thru((estimates) =>
        subject.level === "gov"
          ? estimates
          : _.filter(estimates, ({ org_id }) => org_id === subject.id)
      )
      .groupBy("est_doc")
      .map((grouped_estimates, est_doc) =>
        _.reduce(
          grouped_estimates,
          (memo, { stat, vote }) => ({
            ...memo,
            stat: memo.stat + stat,
            vote: memo.vote + vote,
          }),
          {
            initiative_name: name,
            est_doc,
            stat: 0,
            vote: 0,
          }
        )
      )
      .sortBy(({ est_doc }) => get_est_doc_order(est_doc)) // pre-sort by est doc, so presentation consistent when sorting by other col
      .value()
  );
};
const ByInitiativeTab = ({ panel_args }) => {
  const { subject } = panel_args;

  const initiative_rows = get_initiative_rows(subject);

  const column_configs = {
    initiative_name: {
      index: 0,
      header: text_maker("covid_initiative"),
      is_searchable: true,
      sort_func: string_sort_func,
    },
    ...common_column_configs,
  };

  const [largest_initiative_name, largest_initiative_auth] = _.chain(
    initiative_rows
  )
    .groupBy("initiative_name")
    .mapValues((row) =>
      _.reduce(row, (memo, { vote, stat }) => memo + vote + stat, 0)
    )
    .toPairs()
    .sortBy(([initiative_name, auth_total]) => auth_total)
    .last()
    .value();

  return (
    <Fragment>
      <TM
        k="covid_estimates_initiative_tab_text"
        args={{
          largest_initiative_name,
          largest_initiative_auth,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(initiative_rows, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("covid_estimates_initiative_tab_label")}
      />
    </Fragment>
  );
};

class TabLoadingWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const { ensure_loaded_options } = this.props;

    ensure_loaded(ensure_loaded_options).then(() =>
      this.setState({ loading: false })
    );
  }
  render() {
    const { children } = this.props;

    const { loading } = this.state;

    return (
      <Fragment>
        {loading && (
          <div
            style={{
              position: "relative",
              height: "80px",
              marginBottom: "-10px",
            }}
          >
            <SpinnerWrapper config_name={"tabbed_content"} />
          </div>
        )}
        {!loading && children}
      </Fragment>
    );
  }
}

const tab_content_configs = [
  {
    key: "summary",
    label: text_maker("covid_estimates_summary_tab_label"),
    get_contents: (panel_args) => <SummaryTab panel_args={panel_args} />,
    levels: ["gov", "dept"],
  },
  {
    key: "department",
    label: text_maker("covid_estimates_department_tab_label"),
    get_contents: (panel_args) => (
      <TabLoadingWrapper
        ensure_loaded_options={{
          subject: panel_args.subject,
          covid_estimates: true,
        }}
      >
        <ByDepartmentTab panel_args={panel_args} />
      </TabLoadingWrapper>
    ),
    levels: ["gov"],
  },
  {
    key: "initiative",
    label: text_maker("covid_estimates_initiative_tab_label"),
    get_contents: (panel_args) => (
      <TabLoadingWrapper
        ensure_loaded_options={{
          subject: panel_args.subject,
          covid_initiatives: true,
        }}
      >
        <ByInitiativeTab panel_args={panel_args} />
      </TabLoadingWrapper>
    ),
    levels: ["gov", "dept"],
  },
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
      .map(({ key, get_contents }) => [key, get_contents(panel_args)])
      .fromPairs()
      .value(),
  };
};

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key: "covid_estimates_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_covid_estimates_gov_summary: true,
      requires_covid_estimates: level_name === "dept",
      footnotes: false,
      depends_on: ["orgVoteStatEstimates"],
      source: (subject) => [],
      calculate: function (subject, options) {
        const { orgVoteStatEstimates } = this.tables;
        const gov_total_auth_in_year = orgVoteStatEstimates
          .q(Gov)
          .sum("{{est_in_year}}_estimates");

        const gov_covid_estimates_data = CovidEstimates.get_gov_summary();
        const gov_covid_auth_in_year = _.reduce(
          gov_covid_estimates_data,
          (memo, { vote, stat }) => memo + vote + stat,
          0
        );

        const covid_estimates_data =
          level_name === "gov"
            ? gov_covid_estimates_data
            : CovidEstimates.org_lookup(subject.id);

        if (_.isEmpty(covid_estimates_data)) {
          return false;
        }

        const common = {
          subject,
          gov_total_auth_in_year,
          gov_covid_auth_in_year,
          covid_estimates_data,
          est_doc_summary_stats: _.map(
            covid_estimates_data,
            ({ doc_name, vote, stat }) => [doc_name, vote + stat]
          ),
        };

        if (level_name === "gov") {
          return common;
        } else {
          const dept_tabled_est_in_year = orgVoteStatEstimates
            .q(subject)
            .sum("{{est_in_year}}_estimates");

          return {
            ...common,
            dept_tabled_est_in_year,
          };
        }
      },
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args } = calculations;

        const tabbed_content_props = get_tabbed_content_props(panel_args);

        return (
          <InfographicPanel
            title={text_maker("covid_estimates_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            <div className="frow">
              <div className="fcol-md-12 fcol-xs-12 medium-panel-text text">
                <TM
                  k={"covid_estimates_above_tab_text_gov"}
                  args={panel_args}
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
          </InfographicPanel>
        );
      },
    }),
  });
