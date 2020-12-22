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

import { get_client } from "src/graphql_utils/graphql_utils.js";

import {
  AboveTabFootnoteList,
  ByDepartmentTab,
  ByMeasureTab,
} from "./covid_common_tabs.js";
import {
  get_tabbed_content_props,
  get_est_doc_name,
} from "./covid_common_utils.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_estimates.yaml";

const { CovidMeasure } = Subject;

const { TabbedContent, SpinnerWrapper, AlertBanner } = util_components;

const { text_maker, TM } = create_text_maker_component([text1, text2]);

const client = get_client();

const colors = window.infobase_colors();

const SummaryTab = ({ panel_args, data }) => {
  const { subject } = panel_args;

  const graph_index_key = "index_key";

  const graph_data = _.chain(data)
    .map((row) => ({
      [graph_index_key]: get_est_doc_name(row.est_doc),
      [text_maker(`covid_estimates_stat`)]: row.stat,
      [text_maker(`covid_estimates_voted`)]: row.vote,
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
              fill: window.infobase_color_constants.textColor,
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
        {!window.is_a11y_mode && (
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
              lang: window.lang,
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
              lang: window.lang,
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
          lang: window.lang,
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
        data_type: "estimates",
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
    panel_key: "covid_estimates_panel",
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
            <AlertBanner banner_class="danger">
              {
                "Not real data! Totals are based on estimates by covid initiative figures, but the values associated with these measures are not accurate. For development purposes only!"
              }
            </AlertBanner>
            <CovidEstimatesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
