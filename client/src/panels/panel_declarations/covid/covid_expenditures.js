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
  AboveTabFootnoteList,
  ByDepartmentTab,
  ByMeasureTab,
} from "./covid_common_tabs.js";
import { get_tabbed_content_props } from "./covid_common_utils.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_expenditures.yaml";

const { CovidMeasure } = Subject;

const { text_maker, TM } = create_text_maker_component([text1, text2]);
const { TabbedContent, SpinnerWrapper, Format, AlertBanner } = util_components;

const client = get_client();

const SummaryTab = ({ panel_args, data }) => {
  const { subject } = panel_args;

  const additional_text_args = (() => {
    if (subject.level === "gov") {
      return {};
    } else {
      const dept_covid_expenditures_in_year = _.reduce(
        data,
        (memo, { vote, stat }) => memo + vote + stat,
        0
      );

      return { dept_covid_expenditures_in_year };
    }
  })();

  const format_type = window.is_a11y_mode ? "compact1_written" : "compact1";

  const table_data = _.chain(data)
    .groupBy("is_budgetary")
    .map((rows, is_bud_string) => [
      is_bud_string === "true" ? "bud" : "non_bud",
      _.chain(rows)
        .reduce(
          (memo, row) => ({
            vote: memo.vote + row.vote,
            stat: memo.stat + row.stat,
            total: memo.total + row.vote + row.stat,
          }),
          { vote: 0, stat: 0, total: 0 }
        )

        .value(),
    ])
    .fromPairs()
    .value();

  return (
    <Fragment>
      <TM
        k={`covid_expenditures_summary_text_${subject.level}`}
        args={{ ...panel_args, ...additional_text_args }}
        className="medium-panel-text"
      />
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th scope="col">
              <TM k="covid_expenditures_stat" />
            </th>
            <th scope="col">
              <TM k="covid_expenditures_voted" />
            </th>
            <th scope="col">
              <TM k="total" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <TM k="budgetary" />
            </th>
            <td>
              <Format type={format_type} content={table_data.bud?.stat || 0} />
            </td>
            <td>
              <Format type={format_type} content={table_data.bud?.vote || 0} />
            </td>
            <td>
              <Format type={format_type} content={table_data.bud?.total || 0} />
            </td>
          </tr>
          <tr>
            <th scope="row">
              <TM k="non_budgetary" />
            </th>
            <td>
              <Format
                type={format_type}
                content={table_data.non_bud?.stat || 0}
              />
            </td>
            <td>
              <Format
                type={format_type}
                content={table_data.non_bud?.vote || 0}
              />
            </td>
            <td>
              <Format
                type={format_type}
                content={table_data.non_bud?.total || 0}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">
              <TM k="total" />
            </th>
            <td>
              <Format
                type={format_type}
                content={table_data.bud?.stat + table_data.non_bud?.stat || 0}
              />
            </td>
            <td>
              <Format
                type={format_type}
                content={table_data.bud?.vote + table_data.non_bud?.vote || 0}
              />
            </td>
            <td>
              <Format
                type={format_type}
                content={table_data.bud?.total + table_data.non_bud?.total || 0}
                className="bold"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Fragment>
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

export const declare_covid_expenditures_panel = () =>
  declare_panel({
    panel_key: "covid_expenditures_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      initial_queries: {
        gov_covid_summary_query,
        ...(level_name === "dept" && { org_covid_summary_query }),
      },
      footnotes: false,
      source: (subject) => [],
      calculate: (subject, options) =>
        level_name === "dept"
          ? subject.has_data("covid_response")?.has_expenditures
          : true,
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args, subject } = calculations;
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
                "Real data, but not final. Some reconciliation still pending. For development purposes only!"
              }
            </AlertBanner>
            <CovidExpendituresPanel panel_args={{ ...panel_args, subject }} />
          </InfographicPanel>
        );
      },
    }),
  });
