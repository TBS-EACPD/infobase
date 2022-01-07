import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { StatefulTabs, LeafSpinner, DisplayTable } from "src/components/index";

import { CovidMeasureStore } from "src/models/covid/CovidMeasureStore";
import {
  query_gov_covid_summaries,
  query_gov_covid_summary,
  query_org_covid_summary,
  query_all_covid_estimates_by_measure_id,
  query_org_covid_estimates_by_measure_id,
} from "src/models/covid/queries";
import { yearsWithCovidDataStore } from "src/models/covid/yearsWithCovidDataStore";

import { Dept } from "src/models/subjects";

import { infobase_colors } from "src/core/color_schemes";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { toggle_list } from "src/general_utils";
import { infographic_href_template } from "src/infographic/infographic_href_template";

import { get_source_links } from "src/metadata/data_sources";
import { smart_sort_func } from "src/sort_utils";
import { textColor } from "src/style_constants/index";

import {
  AboveTabFootnoteList,
  YearSelectionTabs,
} from "./covid_common_components";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  get_est_doc_name,
  get_est_doc_order,
  get_est_doc_glossary_key,
  roll_up_flat_measure_data_by_property,
  get_est_doc_list_plain_text,
} from "./covid_common_utils";
import { get_tooltip } from "./covid_estimates_tooltips";
import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_estimates.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

const colors = infobase_colors();

const panel_key = "covid_estimates_panel";

const get_vs_type_name = (vs_type) =>
  _.includes(["vote", "stat"], vs_type)
    ? text_maker(`covid_estimates_${vs_type}`)
    : "";
const vs_type_ordering_by_name = _.mapKeys(
  { vote: 1, stat: 2, both: 3 },
  (_order, key) => get_vs_type_name(key)
);

const get_common_column_configs = (show_vote_stat, est_docs) => ({
  vs_type: {
    index: 1,
    header: text_maker(`vote_or_stat`),
    is_searchable: true,
    is_summable: false,
    formatter: get_vs_type_name,
    plain_formatter: get_vs_type_name,
    sort_func: (plain_a, plain_b, descending) => {
      const order_a = vs_type_ordering_by_name[plain_a];
      const order_b = vs_type_ordering_by_name[plain_b];

      return smart_sort_func(order_a, order_b, descending);
    },
    initial_visible: show_vote_stat,
  },
  ..._.chain(est_docs)
    .sortBy(get_est_doc_order)
    .map((est_doc, ix) => [
      est_doc,
      {
        index: 2 + ix,
        header: get_est_doc_name(est_doc),
        is_searchable: false,
        is_summable: true,
        formatter: "compact2",
      },
    ])
    .fromPairs()
    .value(),
  total: {
    index: 1 + est_docs.length,
    header: text_maker("total"),
    is_searchable: false,
    is_summable: true,
    formatter: "compact2",
    initial_visible: est_docs.length > 1,
  },
});

const ByDepartmentTab = wrap_with_vote_stat_controls(
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const est_docs = _.chain(data).map("est_doc").uniq().value();

    const pre_sorted_dept_data = _.chain(data)
      .flatMap(({ vote, stat, ...row_base }) => {
        if (show_vote_stat) {
          return [
            { ...row_base, vs_type: "vote", value: vote },
            { ...row_base, vs_type: "stat", value: stat },
          ];
        } else {
          return [{ ...row_base, vs_type: "both", value: vote + stat }];
        }
      })
      .groupBy("org_id")
      .flatMap((rows, org_id) =>
        _.chain(rows)
          .groupBy("vs_type")
          .flatMap((vs_group, vs_type) => ({
            org_id,
            vs_type,
            ..._.chain(est_docs)
              .map((est_doc) => [
                est_doc,
                _.chain(vs_group).find({ est_doc }).get("value", 0).value(),
              ])
              .fromPairs()
              .value(),
            total: _.reduce(vs_group, (memo, { value }) => memo + value, 0),
          }))
          .value()
      )
      .sortBy(({ total }) => -total)
      .value();

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
      ...get_common_column_configs(show_vote_stat, est_docs),
    };

    const [largest_dept_id, largest_dept_auth] = _.chain(data)
      .groupBy("org_id")
      .mapValues((data) =>
        _.reduce(data, (memo, { vote, stat }) => memo + vote + stat, 0)
      )
      .toPairs()
      .sortBy(([_org_id, total]) => total)
      .last()
      .value();

    return (
      <Fragment>
        <TM
          k={"covid_estimates_department_tab_text"}
          args={{
            ...panel_args,
            largest_dept_name: Dept.store.lookup(largest_dept_id).name,
            largest_dept_auth,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <DisplayTable
          data={_.map(pre_sorted_dept_data, (row) =>
            _.pick(row, _.keys(column_configs))
          )}
          column_configs={column_configs}
          table_name={text_maker("by_department_tab_label")}
          disable_column_select={true}
          unsorted_initial={true}
        />
      </Fragment>
    );
  }
);

const get_measure_name = (id) => CovidMeasureStore.lookup(id).name;
const ByMeasureTab = wrap_with_vote_stat_controls(
  ({ show_vote_stat, ToggleVoteStat, args: panel_args, data }) => {
    const est_docs = _.chain(data).map("est_doc").uniq().value();

    const pre_sorted_data = _.chain(data)
      .flatMap(({ vote, stat, ...row_base }) => {
        if (show_vote_stat) {
          return [
            { ...row_base, vs_type: "vote", value: vote },
            { ...row_base, vs_type: "stat", value: stat },
          ];
        } else {
          return [{ ...row_base, vs_type: "both", value: vote + stat }];
        }
      })
      .groupBy("measure_id")
      .flatMap((rows, measure_id) =>
        _.chain(rows)
          .groupBy("vs_type")
          .flatMap((vs_group, vs_type) => ({
            measure_id,
            vs_type,
            ..._.chain(est_docs)
              .map((est_doc) => [
                est_doc,
                _.chain(vs_group).find({ est_doc }).get("value", 0).value(),
              ])
              .fromPairs()
              .value(),
            total: _.reduce(vs_group, (memo, { value }) => memo + value, 0),
          }))
          .value()
      )
      .sortBy(({ total }) => -total)
      .value();

    const column_configs = {
      measure_id: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
        formatter: (id) => (
          <Fragment>
            {get_measure_name(id)}
            {get_tooltip(
              "measure",
              panel_args.selected_year,
              panel_args.subject.id,
              id
            )}
          </Fragment>
        ),
        plain_formatter: get_measure_name,
      },
      ...get_common_column_configs(show_vote_stat, est_docs),
    };

    const [largest_measure_id, largest_measure_auth] = _.chain(pre_sorted_data)
      .groupBy("measure_id")
      .map((rows, measure_id) => [
        measure_id,
        _.reduce(rows, (memo, { total }) => memo + total, 0),
      ])
      .sortBy(([_measure_id, total]) => total)
      .last()
      .value();

    return (
      <Fragment>
        <TM
          k={"covid_estimates_measure_tab_text"}
          args={{
            ...panel_args,
            largest_measure_name:
              CovidMeasureStore.lookup(largest_measure_id).name,
            largest_measure_auth,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <DisplayTable
          data={_.map(pre_sorted_data, (row) =>
            _.pick(row, _.keys(column_configs))
          )}
          column_configs={column_configs}
          table_name={text_maker("by_measure_tab_label")}
          disable_column_select={true}
          unsorted_initial={true}
        />
      </Fragment>
    );
  }
);

const SummaryTab = ({ args: panel_args, data }) => {
  return <SummaryTabComponent panel_args={panel_args} data={data} />;
};

const tab_content_configs = [
  {
    key: "summary",
    subject_types: ["gov", "dept"],
    label: text_maker("summary_tab_label"),
    load_data: ({ subject, selected_year }) =>
      (() => {
        if (subject.subject_type === "dept") {
          return query_org_covid_summary({
            org_id: String(subject.id),
            fiscal_year: selected_year,
          });
        } else {
          return query_gov_covid_summary({
            fiscal_year: selected_year,
          });
        }
      })().then((covid_summary) => _.get(covid_summary, "covid_estimates")),
    TabContent: SummaryTab,
  },
  {
    key: "department",
    subject_types: ["gov"],
    label: text_maker("by_department_tab_label"),
    load_data: ({ selected_year }) =>
      query_all_covid_estimates_by_measure_id({
        fiscal_year: selected_year,
      }).then((data) =>
        roll_up_flat_measure_data_by_property(data, "org_id", "est_doc")
      ),
    TabContent: ByDepartmentTab,
  },
  {
    key: "measure",
    subject_types: ["gov", "dept"],
    label: text_maker("by_measure_tab_label"),
    load_data: ({ subject, selected_year }) =>
      (() => {
        if (subject.subject_type === "dept") {
          return query_org_covid_estimates_by_measure_id({
            org_id: String(subject.id),
            fiscal_year: selected_year,
          });
        } else {
          return query_all_covid_estimates_by_measure_id({
            fiscal_year: selected_year,
          });
        }
      })().then((data) =>
        roll_up_flat_measure_data_by_property(data, "measure_id", "est_doc")
      ),
    TabContent: ByMeasureTab,
  },
];

class CovidEstimatesPanel extends React.Component {
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
          .map(({ fiscal_year, covid_estimates }) => [
            fiscal_year,
            covid_estimates,
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
      return <LeafSpinner config_name={"subroute"} />;
    } else {
      const gov_tabled_est_docs_in_year = _.chain(
        summary_by_fiscal_year[selected_year]
      )
        .reduce((est_docs, { est_doc }) => [...est_docs, est_doc], [])
        .sortBy(get_est_doc_order)
        .value();
      const gov_latest_tabled_est_doc_in_year = _.last(
        gov_tabled_est_docs_in_year
      );

      const extended_panel_args = {
        ...panel_args,
        selected_year,
        gov_tabled_est_docs_in_year,
        gov_tabled_est_docs_in_year_text: get_est_doc_list_plain_text(
          gov_tabled_est_docs_in_year
        ),
        gov_latest_tabled_est_doc_in_year_text: get_est_doc_name(
          gov_latest_tabled_est_doc_in_year
        ),
        gov_latest_tabled_est_doc_in_year_glossary_key:
          get_est_doc_glossary_key(gov_latest_tabled_est_doc_in_year),
        gov_covid_estimates_in_year: _.reduce(
          summary_by_fiscal_year[selected_year],
          (memo, { vote, stat }) => memo + vote + stat,
          0
        ),
      };

      const tabbed_content_props = get_tabbed_content_props(
        tab_content_configs,
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="medium-panel-text text">
            <YearSelectionTabs
              years={panel_args.years}
              on_select_year={this.on_select_year}
              selected_year={selected_year}
            />
            <AboveTabFootnoteList subject={panel_args.subject}>
              <TM
                k="covid_estimates_above_tab_footnote_list"
                args={extended_panel_args}
              />
            </AboveTabFootnoteList>
          </div>
          {/* 
            key={selected_year} below is to force a re-render on year change, as React doesn't compare deep enough
            to see the corresponding prop changes in tabbed_content_props itself 
          */}
          <StatefulTabs {...tabbed_content_props} key={selected_year} />
        </Fragment>
      );
    }
  }
}

class SummaryTabComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [
        text_maker(`covid_estimates_stat`),
        text_maker(`covid_estimates_vote`),
      ],
    };

    const data = this.props.data;

    this.graph_index_key = "index_key";

    this.sorted_data = _.sortBy(data, ({ est_doc }) =>
      get_est_doc_order(est_doc)
    );

    this.graph_data = _.chain(this.sorted_data)
      .map(({ est_doc, stat, vote }) => ({
        [this.graph_index_key]: get_est_doc_name(est_doc),
        [text_maker(`covid_estimates_stat`)]: stat,
        [text_maker(`covid_estimates_vote`)]: vote,
      }))
      .value();

    this.graph_keys = _.chain(this.graph_data)
      .first()
      .omit(this.graph_index_key)
      .keys()
      .value();
  }

  filter_graph() {
    return _.map(this.graph_data, (data) =>
      _.pick(data, [this.graph_index_key, ...this.state.selected])
    );
  }

  graph_content() {
    return (
      <WrappedNivoBar
        data={this.filter_graph()}
        keys={this.graph_keys}
        indexBy={this.graph_index_key}
        colors={(d) => colors(d.id)}
        margin={{
          top: 50,
          right: 40,
          bottom: 120,
          left: 40,
        }}
        bttm_axis={{
          format: (d) =>
            _.words(d).length > 3 ? d.substring(0, 20) + "..." : d,
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
  }

  render() {
    const { subject, selected_year } = this.props.panel_args;
    const additional_text_args = (() => {
      if (subject.subject_type === "gov") {
        return {
          covid_est_pct_of_all_est:
            this.props.panel_args[`gov_covid_estimates_in_year`] /
            this.props.panel_args[`gov_total_estimates_in_year`],
        };
      } else {
        const dept_covid_estimates_in_year = _.reduce(
          this.sorted_data,
          (memo, { stat, vote }) => memo + vote + stat,
          0
        );

        return {
          dept_covid_estimates_in_year,
        };
      }
    })();

    return (
      <div className="row align-items-center">
        <div className="col-12 col-lg-6 medium-panel-text">
          <TM
            k={`covid_estimates_summary_text_${subject.subject_type}`}
            args={{ ...this.props.panel_args, ...additional_text_args }}
          />
          <TM k={"covid_estimates_by_release_title"} />
          <ul>
            {_.map(this.sorted_data, ({ est_doc, vote, stat }) => (
              <li key={est_doc}>
                <TM
                  k={"covid_estimates_by_release"}
                  args={{
                    est_doc_name: get_est_doc_name(est_doc),
                    est_doc_glossary_key: get_est_doc_glossary_key(est_doc),
                    total: vote + stat,
                  }}
                  el="span"
                  style={{ display: "inline-block" }}
                />
                {get_tooltip(
                  "est_doc_total",
                  selected_year,
                  subject.id,
                  est_doc
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-12 col-lg-6">
          {!is_a11y_mode && (
            <StandardLegend
              legendListProps={{
                items: _.map(this.graph_keys, (key) => ({
                  id: key,
                  label: key,
                  active: _.includes(this.state.selected, key),
                  color: colors(key),
                })),
                isHorizontal: true,
                onClick: (label) => {
                  !(
                    this.state.selected.length === 1 &&
                    this.state.selected.includes(label)
                  ) &&
                    this.setState({
                      selected: toggle_list(this.state.selected, label),
                    });
                },
              }}
            />
          )}
          {this.graph_content()}
        </div>
      </div>
    );
  }
}

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key,
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      requires_years_with_covid_data: true,
      requires_covid_measures: true,
      title: text_maker("covid_measure_spending_auth"),
      footnotes: ["COVID", "COVID_AUTH", "COVID_MEASURE"],
      depends_on: [],
      source: () => get_source_links(["COVID"]),
      calculate: function (subject) {
        const years_with_estimates =
          yearsWithCovidDataStore.has(subject.id) &&
          yearsWithCovidDataStore.lookup(subject.id).years_with_estimates;
        return (
          !_.isEmpty(years_with_estimates) && { years: years_with_estimates }
        );
      },
      render: ({
        title,
        calculations: { panel_args, subject },
        footnotes,
        sources,
      }) => (
        <InfographicPanel
          allowOverflow={true}
          {...{
            title,
            sources,
            footnotes,
          }}
        >
          <CovidEstimatesPanel panel_args={{ ...panel_args, subject }} />
        </InfographicPanel>
      ),
    }),
  });
