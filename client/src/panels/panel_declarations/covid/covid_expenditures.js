import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  TabbedContent,
  TabLoadingSpinner,
  DisplayTable,
  AlertBanner,
} from "src/components/index";

import {
  query_gov_covid_summaries,
  query_top_covid_spending,
  query_all_covid_expenditures_by_measure_id,
  query_org_covid_expenditures_by_measure_id,
} from "src/models/covid/queries";
import { Subject } from "src/models/subject";

import { breakpoints } from "src/core/breakpoint_defs";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import { infograph_options_href_template } from "src/infographic/infographic_link";

import {
  YearSelectionTabs,
  AboveTabFootnoteList,
} from "./covid_common_components";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  string_sort_func,
  roll_up_flat_measure_data_by_property,
  get_date_last_updated_text,
} from "./covid_common_utils";
import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_expenditures.yaml";

const { YearsWithCovidData, CovidMeasure, Dept } = Subject;

const { text_maker, TM } = covid_create_text_maker_component(text);

const panel_key = "covid_expenditures_panel";

const SummaryTab = ({ args: panel_args, data }) => {
  const { gov_covid_expenditures_in_year } = panel_args;
  const { top_spending_orgs, top_spending_measures } = data;

  const { name: top_spending_org_name, spending: top_spending_org_amount } =
    _.first(top_spending_orgs);
  const {
    name: top_spending_measure_name,
    spending: top_spending_measure_amount,
  } = _.first(top_spending_measures);
  const text_args = {
    ...panel_args,
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
        <MediaQuery minWidth={breakpoints.minLargeDevice}>
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
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const pre_sorted_rows = get_expenditures_by_index(data, "org_id");

    const column_configs = {
      org_id: {
        index: 0,
        header: text_maker("org"),
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
            ...panel_args,
            largest_dept: Dept.lookup(largest_dept_id),
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
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const pre_sorted_rows_with_measure_names = _.chain(
      get_expenditures_by_index(data, "measure_id")
    )
      .map(({ measure_id, ...row }) => ({
        ...row,
        measure_name: CovidMeasure.lookup(measure_id).name,
      }))
      .value();

    const column_configs = {
      measure_name: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
        sort_func: (name_a, name_b) => string_sort_func(name_a, name_b),
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

    const subject_level = panel_args.subject.level;
    const text_args = {
      ...panel_args,
      largest_measure_name,
      largest_measure_exp,
      ...(subject_level === "dept" && {
        dept_covid_expenditures_in_year: _.reduce(
          data,
          (memo, { vote, stat }) => memo + vote + stat,
          0
        ),
      }),
    };
    return (
      <Fragment>
        {subject_level === "dept"}
        <TM
          k={`covid_expenditures_measure_tab_text_${subject_level}`}
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
    levels: ["gov"],
    label: text_maker("summary_tab_label"),
    load_data: ({ selected_year }) =>
      query_top_covid_spending({ fiscal_year: selected_year }),
    TabContent: SummaryTab,
  },
  {
    key: "department",
    levels: ["gov"],
    label: text_maker("by_department_tab_label"),
    load_data: ({ selected_year }) =>
      query_all_covid_expenditures_by_measure_id({
        fiscal_year: selected_year,
      }).then((data) => roll_up_flat_measure_data_by_property(data, "org_id")),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    levels: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject, selected_year }) =>
      (() => {
        if (subject.level === "dept") {
          return query_org_covid_expenditures_by_measure_id({
            org_id: String(subject.id),
            fiscal_year: selected_year,
          });
        } else {
          return query_all_covid_expenditures_by_measure_id({
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
      selected_year: _.last(props.panel_args.years),
    };
  }
  componentDidMount() {
    query_gov_covid_summaries().then((covid_summaries) =>
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
    const { panel_args } = this.props;

    if (loading) {
      return <TabLoadingSpinner />;
    } else {
      const { month_last_updated, vote, stat } =
        summary_by_fiscal_year[selected_year];

      const gov_covid_expenditures_in_year = vote + stat;

      const extended_panel_args = {
        ...panel_args,
        selected_year,
        next_year: +selected_year + 1,
        date_last_updated_text: get_date_last_updated_text(
          selected_year,
          month_last_updated
        ),
        gov_covid_expenditures_in_year,
      };

      const { tab_keys, tab_labels, tab_pane_contents } =
        get_tabbed_content_props(tab_content_configs, extended_panel_args);

      return (
        <Fragment>
          <div className="medium-panel-text text">
            <YearSelectionTabs
              years={panel_args.years}
              on_select_year={this.on_select_year}
              selected_year={selected_year}
            />
            {selected_year === 2021 && (
              <AlertBanner banner_class={"warning"}>
                {
                  "Warning: 2021 expenditures here are just a copy of 2020 expenditures, to facilitate early development work"
                }
              </AlertBanner>
            )}
            <AboveTabFootnoteList subject={panel_args.subject}>
              <TM
                k="covid_expenditures_above_tab_footnote_list"
                args={extended_panel_args}
              />
            </AboveTabFootnoteList>
          </div>
          {/* 
            key={selected_year} below is to force a re-render on year change, as React doesn't compare deep enough
            to see the corresponding prop changes in tabbed_content_props itself 
          */}
          {tab_keys.length === 1 && (
            <Fragment key={selected_year}>
              <div className="panel-separator" />
              {tab_pane_contents?.[tab_keys[0]]}
            </Fragment>
          )}
          {tab_keys.length > 1 && (
            <TabbedContent
              {...{ tab_keys, tab_labels, tab_pane_contents }}
              key={selected_year}
            />
          )}
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
      requires_years_with_covid_data: true,
      requires_covid_measures: true,
      title: text_maker("covid_expenditures_estimated_exp"),
      footnotes: ["COVID", "COVID_EXP", "COVID_MEASURE"],
      source: (subject) => [],
      calculate: (subject, options) => {
        const years_with_expenditures = YearsWithCovidData.lookup(
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
        calculations: { panel_args, subject },
        footnotes,
        sources,
      }) => (
        <InfographicPanel
          {...{
            title,
            sources,
            footnotes,
          }}
        >
          <CovidExpendituresPanel panel_args={{ ...panel_args, subject }} />
        </InfographicPanel>
      ),
    }),
  });
