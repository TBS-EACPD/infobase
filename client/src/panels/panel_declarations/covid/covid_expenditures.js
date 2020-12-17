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
} from "../shared.js";

import { SummaryTab } from "./covid_tab_contents.js";

import text from "./covid_expenditures.yaml";

const { CovidMeasure, Gov } = Subject;

const { text_maker, TM } = create_text_maker_component([text]);
const { TabbedContent, SpinnerWrapper, TabLoadingWrapper } = util_components;

const client = get_client();

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

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        data_type: "expenditures",
        gov_covid_expenditures_in_year,
      };

      return (
        <Fragment>
          <div className="frow">
            <div className="fcol-md-12 fcol-xs-12 medium-panel-text text">
              <TabbedContent
                tab_keys={["summary"]}
                tab_labels={{ summary: "Overview" }}
                tab_pane_contents={{
                  summary: (
                    <TabLoadingWrapper
                      panel_args={extended_panel_args}
                      load_data={(panel_args) => {
                        const { subject } = panel_args;
                        console.log();

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
                                _.get(
                                  response,
                                  "data.root.orgs.covid_summary.covid_expenditures"
                                ),
                            };
                          } else {
                            return {
                              query: gov_covid_summary_query,
                              variables: {
                                lang: window.lang,
                                _query_name: "gov_covid_summary_query",
                              },
                              response_accessor: (response) =>
                                _.get(
                                  response,
                                  "data.root.gov.covid_summary.covid_expenditures"
                                ),
                            };
                          }
                        })();

                        return client
                          .query({ query, variables })
                          .then(response_accessor);
                      }}
                      TabContent={SummaryTab}
                    />
                  ),
                }}
              />
            </div>
          </div>
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
      depends_on: ["orgVoteStatPa"],
      source: (subject) => [],
      calculate: function (subject, options) {
        if (level_name === "dept" && !subject.has_data("covid_response")) {
          return false;
        }

        const { orgVoteStatPa } = this.tables;
        const gov_total_expenditures_in_year = orgVoteStatPa
          .q(Gov)
          .sum("{{pa_last_year}}exp");

        return {
          subject,
          gov_total_expenditures_in_year,
        };
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
            <CovidExpendituresPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
