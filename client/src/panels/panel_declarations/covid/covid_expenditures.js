import { Fragment } from "react";

import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "src/models/covid/queries.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { infograph_options_href_template } from "src/infographic/infographic_link.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  util_components,
  Subject,
  ensure_loaded,
} from "../shared.js";

import { AboveTabFootnoteList } from "./covid_common_components.js";
import {
  get_tabbed_content_props,
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

const panel_key = "covid_expenditures_panel";
const last_refreshed_date = "date"; // TODO, would rather not hard code this here, but where else where it live?

const SummaryTab = ({
  panel_args,
  data: { covid_expenditures, covid_funding },
}) => {
  const { subject } = panel_args;

  const additional_text_args = (() => {
    if (subject.level === "gov") {
      return {};
    } else {
      const dept_covid_expenditures_in_year = _.reduce(
        covid_expenditures,
        (memo, { vote, stat }) => memo + vote + stat,
        0
      );

      return {
        dept_covid_expenditures_in_year,
        dept_covid_funding_in_year: _.first(covid_funding).funding,
      };
    }
  })();

  return (
    <Fragment>
      <TM
        k={`covid_expenditures_summary_text_${subject.level}`}
        args={{ ...panel_args, ...additional_text_args }}
        className="medium-panel-text"
      />
      {
        "TODO rethink visualization, table not necessary with bud/non-bud dropped, but what's next will need to wait on FIN cash values being implemented"
      }
    </Fragment>
  );
};

const common_column_configs = {
  stat: {
    index: 1,
    header: text_maker("covid_expenditures_stat"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
  },
  vote: {
    index: 2,
    header: text_maker("covid_expenditures_voted"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
  },
};

const ByDepartmentTab = ({
  panel_args,
  data: { covid_expenditures, covid_funding },
}) => {
  // pre-sort by key, so presentation consistent when sorting by other col
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
    ...common_column_configs,
  };

  const [largest_dept_id, largest_dept_exp] = _.chain(covid_expenditures)
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
        k={"covid_expenditures_department_tab_text"}
        args={{
          ...panel_args,
          largest_dept_name: Dept.lookup(largest_dept_id).name,
          largest_dept_exp,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(covid_expenditures, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("by_department_tab_label")}
      />
    </Fragment>
  );
};

const ByMeasureTab = ({
  panel_args,
  data: { covid_expenditures, covid_funding },
}) => {
  // pre-sort by key, so presentation consistent when sorting by other col
  const data_with_measure_names = _.chain(covid_expenditures)
    .map((row) => ({
      ...row,
      measure_name: CovidMeasure.lookup(row.measure_id).name,
    }))
    .value();

  const column_configs = {
    measure_name: {
      index: 0,
      header: text_maker("covid_measure"),
      is_searchable: true,
      sort_func: (name) => string_sort_func(name),
    },
    ...common_column_configs,
  };

  const [largest_measure_name, largest_measure_exp] = _.chain(
    data_with_measure_names
  )
    .groupBy("measure_name")
    .map((rows, measure_name) => [
      measure_name,
      _.reduce(rows, (memo, { vote, stat }) => memo + vote + stat, 0),
    ])
    .sortBy(([_measure_name, total]) => total)
    .last()
    .value();

  return (
    <Fragment>
      <TM
        k={"covid_expenditures_measure_tab_text"}
        args={{
          ...panel_args,
          largest_measure_name,
          largest_measure_exp,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(data_with_measure_names, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("by_measure_tab_label")}
      />
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
              _.get(response, "data.root.org.covid_summary"),
          };
        } else {
          return {
            query: gov_covid_summary_query,
            variables: {
              lang: window.lang,
              _query_name: "gov_covid_summary_query",
            },
            response_accessor: (response) =>
              _.get(response, "data.root.gov.covid_summary"),
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
      ensure_loaded({
        covid_expenditures: true,
        covid_funding: true,
        subject,
      }).then(() =>
        _.chain(["expenditures", "funding"])
          .map((data_type) => [
            `covid_${data_type}`,
            CovidMeasure.get_all_data_by_org(data_type),
          ])
          .fromPairs()
          .value()
      ),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    levels: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject }) =>
      ensure_loaded({
        covid_expenditures: true,
        covid_funding: true,
        subject,
      }).then(() =>
        _.chain(["expenditures", "funding"])
          .map((data_type) => [
            `covid_${data_type}`,
            subject.level === "gov"
              ? CovidMeasure.gov_data_by_measure(data_type)
              : CovidMeasure.org_lookup_data_by_measure(data_type, subject.id),
          ])
          .fromPairs()
          .value()
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
                covid_summary: { covid_expenditures, covid_funding },
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
            gov_covid_funding_in_year: _.first(covid_funding).funding,
            loading: false,
          });
        }
      );
  }
  render() {
    const {
      loading,
      gov_covid_expenditures_in_year,
      gov_covid_funding_in_year,
    } = this.state;
    const { panel_args } = this.props;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        last_refreshed_date,
        gov_covid_expenditures_in_year,
        gov_covid_funding_in_year,
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
    panel_key,
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
          ? subject.has_data("covid_response")?.has_expenditures // TODO ugh, does this need to be || has_funding? Does this panel have to handle all three cases of either or and both?
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
                "Not real data! Fake data based on the already fake dev-purposes covid estimates. Scale and distribution of values does not reflect what is expected in the real expendture data. For development purposes only!"
              }
            </AlertBanner>
            <CovidExpendituresPanel panel_args={{ ...panel_args, subject }} />
          </InfographicPanel>
        );
      },
    }),
  });
