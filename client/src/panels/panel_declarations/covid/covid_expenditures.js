import { Fragment } from "react";

import { get_client } from "../../../graphql_utils/graphql_utils.js";
import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "../../../models/covid/queries.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  util_components,
  Subject,
  ensure_loaded,
} from "../shared.js";

import {
  SummaryTab,
  ByDepartmentTab,
  ByMeasureTab,
  AboveTabFootnoteList,
} from "./covid_common_components.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_expenditures.yaml";

const { CovidMeasure } = Subject;

const { text_maker, TM } = create_text_maker_component([text1, text2]);
const {
  TabbedContent,
  SpinnerWrapper,
  TabLoadingWrapper,
  AlertBanner,
} = util_components;

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
              _.get(response, "data.root.org.covid_summary.covid_expenditures"),
          };
        } else {
          return {
            query: gov_covid_summary_query,
            variables: {
              lang: window.lang,
              _query_name: "gov_covid_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.gov.covid_summary.covid_expenditures"),
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
      ensure_loaded({ covid_expenditures: true, subject }).then(() =>
        CovidMeasure.get_all_data_by_org("expenditures", "is_budgetary")
      ),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    levels: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({ covid_expenditures: true, subject }).then(() =>
        subject.level === "gov"
          ? CovidMeasure.gov_data_by_measure("expenditures", "is_budgetary")
          : CovidMeasure.org_lookup_data_by_measure("expenditures", subject.id)
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
          lang: window.lang,
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
    const { level } = panel_args.subject;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        data_type: "expenditures",
        gov_covid_expenditures_in_year,
      };
      const tabbed_content_props = get_tabbed_content_props(
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="frow">
            <div className="fcol-md-12 fcol-xs-12 medium-panel-text text">
              <TM
                k={`covid_expenditures_above_tab_text_${level}`}
                args={extended_panel_args}
              />
              <AboveTabFootnoteList list_text_key="covid_estimates_above_tab_footnote_list" />
            </div>
          </div>
          <TabbedContent {...tabbed_content_props} />
        </Fragment>
      );
    }
  }
}

export const declare_covid_expenditures_panel = () =>
  declare_panel({
    panel_key: "covid_expenditures_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      initial_queries: {
        gov: { gov_covid_summary_query },
        dept: { org_covid_summary_query },
      }[level_name],
      footnotes: false,
      source: (subject) => [],
      calculate: function (subject, options) {
        if (level_name === "dept" && !subject.has_data("covid_response")) {
          return false;
        }

        return { subject };
      },
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("covid_expenditures_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            <AlertBanner banner_class="danger">
              {
                "Not real data! Faked based on the already fake dev-purposes covid estimates. Scale and distribution of values does not reflect what is expected in the real expendture data. For development purposes only!"
              }
            </AlertBanner>
            <CovidExpendituresPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
