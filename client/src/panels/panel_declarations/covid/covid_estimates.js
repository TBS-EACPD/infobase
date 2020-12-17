import _ from "lodash";
import React, { Fragment } from "react";

import {
  Subject,
  util_components,
  create_text_maker_component,
  InfographicPanel,
  ensure_loaded,
  declare_panel,
} from "src/panels/panel_declarations/shared.js";

import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "src/models/covid/queries.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import {
  SummaryTab,
  ByDepartmentTab,
  ByMeasureTab,
} from "./covid_tab_contents.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_estimates.yaml";

const {
  TabbedContent,
  SpinnerWrapper,
  AlertBanner,
  TabLoadingWrapper,
} = util_components;

const { text_maker, TM } = create_text_maker_component([text1, text2]);

const client = get_client();

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
    label: text_maker("covid_estimates_measure_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({ covid_estimates: true, subject }).then(() =>
        subject.level === "gov"
          ? CovidMeasure.gov_estimates_by_measure()
          : CovidMeasure.org_lookup_estimates_by_measure(subject.id)
      ),
    TabContent: ByMeasureTab,
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
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="frow">
            <div className="fcol-md-12 fcol-xs-12 medium-panel-text text">
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
        gov_covid_summary_query,
        ...(level_name === "dept" && { org_covid_summary_query }),
      },
      footnotes: ["COVID", "COVID_AUTH"],
      depends_on: [],
      source: (subject) => [],
      calculate: function (subject, options) {
        if (level_name === "dept" && !subject.has_data("covid_response")) {
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
                "Not real data! Totals are bassed on estimates by covid initiative figures, but the values associated with these measures are not accurate. For development purposes only!"
              }
            </AlertBanner>
            <CovidEstimatesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
