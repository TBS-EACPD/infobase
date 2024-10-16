import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { TabsStateful, LeafSpinner, DisplayTable } from "src/components/index";

import { CovidMeasureStore } from "src/models/covid/CovidMeasureStore";
import {
  promisedGovCovidSummaries,
  promisedTopCovidSpending,
  promisedAllCovidExpendituresByMeasureId,
  promisedOrgCovidExpendituresByMeasureId,
} from "src/models/covid/queries";
import { yearsWithCovidDataStore } from "src/models/covid/yearsWithCovidDataStore";

import { Dept } from "src/models/subjects";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";
import { infographic_href_template } from "src/infographic/infographic_href_template";
import { minLargeDevice } from "src/style_constants/index";

import {
  YearSelectionTabs,
  AboveTabFootnoteList,
} from "./covid_common_components";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  roll_up_flat_measure_data_by_property,
  get_date_last_updated_text,
} from "./covid_common_utils";
import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_expenditures.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

const panel_key = "covid_expenditures_panel";

const SummaryTab = ({ args: { calculations }, data }) => {
  const { gov_covid_expenditures_in_year } = calculations;
  const { top_spending_orgs, top_spending_measures } = data;

  const { name: top_spending_org_name, spending: top_spending_org_amount } =
    _.first(top_spending_orgs);
  const {
    name: top_spending_measure_name,
    spending: top_spending_measure_amount,
  } = _.first(top_spending_measures);
  const text_args = {
    ...calculations,
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
    <div className="row align-items-center">
      <TM
        k={`covid_expenditures_overview_tab_text`}
        args={text_args}
        className="medium-panel-text col-12"
      />
      <div className="col-md-12">
        <TM k={`covid_top_spending_orgs`} el={"h3"} />
        <SummaryTabPie
          data={top_spending_orgs}
          other_items_label={text_maker("covid_all_other_orgs")}
          reverse_layout={false}
        />
      </div>
      <div className="col-12">
        <TM k={`covid_top_spending_measures`} el={"h3"} />
        <MediaQuery minWidth={minLargeDevice}>
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
    .sortBy(({ total_exp }) => -total_exp)
    .value();

const get_common_column_configs = (show_vote_stat) => ({
  vote: {
    index: 2,
    header: text_maker("covid_expenditures_voted"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: show_vote_stat,
  },
  stat: {
    index: 3,
    header: text_maker("covid_expenditures_stat"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: show_vote_stat,
  },
  total_exp: {
    index: 4,
    header: text_maker("covid_estimated_expenditures"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: !show_vote_stat,
  },
});

const ByDepartmentTab = wrap_with_vote_stat_controls(
  ({ show_vote_stat, ToggleVoteStat, args: { calculations }, data }) => {
    const pre_sorted_rows = get_expenditures_by_index(data, "org_id");

    const column_configs = {
      org_id: {
        index: 0,
        header: text_maker("org"),
        is_searchable: true,
        formatter: (org_id) => {
          const org = Dept.store.lookup(org_id);

          return (
            <a
              href={infographic_href_template(org, "covid", {
                panel_key,
              })}
            >
              {org.name}
            </a>
          );
        },
        plain_formatter: (org_id) => Dept.store.lookup(org_id).name,
      },
      ...get_common_column_configs(show_vote_stat),
    };

    const { org_id: largest_dept_id, total_exp: largest_dept_exp } = _.chain(
      pre_sorted_rows
    )
      .sortBy("total_exp")
      .last()
      .value();

    return (
      <Fragment>
        <TM
          k={"covid_expenditures_department_tab_text"}
          args={{
            ...calculations,
            largest_dept: Dept.store.lookup(largest_dept_id),
            largest_dept_exp,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <DisplayTable
          data={pre_sorted_rows}
          column_configs={column_configs}
          table_name={text_maker("by_department_tab_label")}
          disable_column_select={true}
          unsorted_initial={true}
        />
      </Fragment>
    );
  }
);

const ByMeasureTab = wrap_with_vote_stat_controls(
  ({
    show_vote_stat,
    ToggleVoteStat,
    args: { subject, calculations },
    data,
  }) => {
    const pre_sorted_rows_with_measure_names = _.chain(
      get_expenditures_by_index(data, "measure_id")
    )
      .map(({ measure_id, ...row }) => ({
        ...row,
        measure_name: CovidMeasureStore.lookup(measure_id).name,
      }))
      .value();

    const column_configs = {
      measure_name: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
      },
      ...get_common_column_configs(show_vote_stat),
    };

    const {
      measure_name: largest_measure_name,
      total_exp: largest_measure_exp,
    } = _.chain(pre_sorted_rows_with_measure_names)
      .sortBy("total_exp")
      .last()
      .value();

    const subject_type = subject.subject_type;
    const text_args = {
      subject,
      ...calculations,
      largest_measure_name,
      largest_measure_exp,
      ...(subject_type === "dept" && {
        dept_covid_expenditures_in_year: _.reduce(
          data,
          (memo, { vote, stat }) => memo + vote + stat,
          0
        ),
      }),
    };
    return (
      <Fragment>
        {subject_type === "dept"}
        <TM
          k={`covid_expenditures_measure_tab_text_${subject_type}`}
          args={text_args}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <DisplayTable
          data={pre_sorted_rows_with_measure_names}
          column_configs={column_configs}
          table_name={text_maker("by_measure_tab_label")}
          disable_column_select={true}
          unsorted_initial={true}
        />
      </Fragment>
    );
  }
);

const tab_content_configs = [
  {
    key: "summary",
    subject_types: ["gov"],
    label: text_maker("summary_tab_label"),
    load_data: ({ calculations: { selected_year } }) =>
      promisedTopCovidSpending({ fiscal_year: selected_year }),
    TabContent: SummaryTab,
  },
  {
    key: "department",
    subject_types: ["gov"],
    label: text_maker("by_department_tab_label"),
    load_data: ({ calculations: { selected_year } }) =>
      promisedAllCovidExpendituresByMeasureId({
        fiscal_year: selected_year,
      }).then((data) => roll_up_flat_measure_data_by_property(data, "org_id")),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    subject_types: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject, calculations: { selected_year } }) =>
      (() => {
        if (subject.subject_type === "dept") {
          return promisedOrgCovidExpendituresByMeasureId({
            org_id: String(subject.id),
            fiscal_year: selected_year,
          });
        } else {
          return promisedAllCovidExpendituresByMeasureId({
            fiscal_year: selected_year,
          });
        }
      })().then((data) =>
        roll_up_flat_measure_data_by_property(data, "measure_id")
      ),
    TabContent: ByMeasureTab,
  },
];

class CovidExpendituresPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      summary_by_fiscal_year: null,
      selected_year: _.last(props.calculations.years),
    };
  }
  componentDidMount() {
    promisedGovCovidSummaries().then((covid_summaries) =>
      this.setState({
        summary_by_fiscal_year: _.chain(covid_summaries)
          .map(({ fiscal_year, covid_expenditures }) => [
            fiscal_year,
            covid_expenditures,
          ])
          .fromPairs()
          .value(),
        loading: false,
      })
    );
  }
  on_select_year = (year) => this.setState({ selected_year: year });
  render() {
    const { loading, selected_year, summary_by_fiscal_year } = this.state;
    const { subject, calculations } = this.props;

    if (loading) {
      return <LeafSpinner config_name={"subroute"} />;
    } else {
      const { month_last_updated, vote, stat } =
        summary_by_fiscal_year[selected_year];

      const gov_covid_expenditures_in_year = vote + stat;

      const extended_calculations = {
        ...calculations,
        selected_year,
        next_year: +selected_year + 1,
        date_last_updated_text: get_date_last_updated_text(
          selected_year,
          month_last_updated
        ),
        gov_covid_expenditures_in_year,
      };

      const tabs = get_tabbed_content_props(
        tab_content_configs,
        subject,
        extended_calculations
      );

      return (
        <YearSelectionTabs
          years={calculations.years}
          on_select_year={this.on_select_year}
          selected_year={selected_year}
        >
          <AboveTabFootnoteList subject={subject}>
            <TM
              k="covid_expenditures_above_tab_footnote_list"
              args={extended_calculations}
            />
          </AboveTabFootnoteList>
          {/* 
            key={selected_year} below is to force a re-render on year change, as React doesn't compare deep enough
            to see the corresponding prop changes in tabbed_content_props itself 
          */}
          {_.size(tabs) === 1 && (
            <Fragment key={selected_year}>
              <div className="panel-separator" />
              {tabs[_.keys(tabs)[0]].content}
            </Fragment>
          )}
          {_.size(tabs) > 1 && <TabsStateful tabs={tabs} key={selected_year} />}
        </YearSelectionTabs>
      );
    }
  }
}

export const declare_covid_expenditures_panel = () =>
  declare_panel({
    panel_key,
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: [
        "requires_years_with_covid_data",
        "requires_covid_measures",
      ],
      get_title: () => text_maker("covid_expenditures_estimated_exp"),
      get_dataset_keys: () => ["covid_exp"],
      calculate: ({ subject }) => {
        const years_with_expenditures = yearsWithCovidDataStore.lookup(
          subject.id
        )?.years_with_expenditures;
        return (
          !_.isEmpty(years_with_expenditures) && {
            years: years_with_expenditures,
          }
        );
      },
      render: ({
        title,
        subject,
        calculations,
        footnotes,
        sources,
        datasets,
      }) => (
        <InfographicPanel
          {...{
            title,
            sources,
            datasets,
            footnotes,
          }}
        >
          <CovidExpendituresPanel
            subject={subject}
            calculations={calculations}
          />
        </InfographicPanel>
      ),
    }),
  });
