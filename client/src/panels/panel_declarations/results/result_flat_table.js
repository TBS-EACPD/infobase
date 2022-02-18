import _ from "lodash";
import React, { Fragment, useState } from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  LeafSpinner,
  DisplayTable,
  ModalButton,
  Tabs,
} from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { Indicator } from "src/models/results";

import { ensure_loaded } from "src/core/ensure_loaded";
import { lang } from "src/core/injected_build_constants";

import { toggle_list } from "src/general_utils";
import { infographic_href_template } from "src/infographic/infographic_href_template";
import { get_source_links } from "src/metadata/data_sources";
import { smart_sort_func } from "src/sort_utils";

import IndicatorDisplayPanel from "./IndicatorDisplayPanel";

import { StatusIconTable, large_status_icons } from "./result_components";

import { create_full_results_hierarchy } from "./result_drilldown/result_hierarchies";
import { TM, text_maker } from "./result_text_provider";
import {
  ResultCounts,
  GranularResultCounts,
  result_docs,
  result_statuses,
  indicator_text_functions,
} from "./results_common";

import "./result_flat_table.scss";

const { months } = businessConstants;

const { indicator_target_text, indicator_actual_text } =
  indicator_text_functions;

const get_drr_year = (drr_key) => result_docs[drr_key].year;

const get_subject_result_counts = (subject) =>
  subject.subject_type === "dept"
    ? ResultCounts.get_dept_counts(subject.id)
    : GranularResultCounts.get_subject_counts(subject.id);
const get_drr_keys_with_data = (subject) => {
  const subject_result_counts = get_subject_result_counts(subject);

  const had_doc_data = (doc) => {
    const count_key = `${doc}_total`;
    return (
      /drr/.test(doc) &&
      !_.isUndefined(subject_result_counts) &&
      !_.isNull(subject_result_counts[count_key]) &&
      subject_result_counts[count_key] > 0
    );
  };

  return _.chain(result_docs).keys().filter(had_doc_data).sort().value();
};

const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {
    id: indicator_node.parent_id,
  });
  if (_.includes(["cr", "program"], parent.data.type)) {
    return parent;
  } else if (parent.data.type === "dr" || parent.data.type === "result") {
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    throw new Error(
      `Result component ${indicator_node} has no (sub)program or CR parent`
    );
  }
};

const get_indicators = (subject, doc) => {
  const full_results_hierarchy = create_full_results_hierarchy({
    subject_guid: subject.guid,
    doc,
    allow_no_result_branches: false,
  });
  return _.chain(full_results_hierarchy)
    .filter((node) => node.data.type === "indicator")
    .map((indicator_node) => ({
      ...indicator_node.data,
      parent_node: get_actual_parent(indicator_node, full_results_hierarchy),
    }))
    .value();
};

const subject_link = (node) => (
  <span>
    <a href={infographic_href_template(node.data.subject, "results")}>
      {node.data.name}
    </a>
    <span className="text-nowrap">
      {" "}
      (
      {text_maker(
        node.data.subject.subject_type === "program"
          ? node.data.subject.subject_type
          : "core_resp"
      )}
      )
    </span>
  </span>
);

const date_join_character = "/";
const get_date_to_achieve = ({ target_year, target_month }) => {
  if (_.isNumber(target_month) && _.isNumber(target_year)) {
    return `${target_month}${date_join_character}${target_year}`;
  } else if (_.isNumber(target_year)) {
    return _.toString(target_year);
  } else {
    return text_maker("unspecified");
  }
};
const split_date_to_achieve = (date_to_achieve) => {
  const split_date = _.split(date_to_achieve, date_join_character);

  if (split_date.length === 2) {
    return _.map(split_date, _.toNumber);
  } else if (!_.isNaN(+date_to_achieve)) {
    return [-Infinity, +date_to_achieve];
  } else {
    return [-Infinity, -Infinity];
  }
};
const format_date_to_achieve = (date_to_achieve) => {
  const [month, year] = split_date_to_achieve(date_to_achieve);

  if (month > 0) {
    return `${months[month].text} ${year}`;
  } else {
    return date_to_achieve;
  }
};
const sort_date_to_achieve = (
  _plain_a,
  _plain_b,
  descending,
  cell_value_a,
  cell_value_b
) => {
  const [month_a, year_a] = split_date_to_achieve(cell_value_a);
  const [month_b, year_b] = split_date_to_achieve(cell_value_b);

  const year_sort_value = smart_sort_func(year_a, year_b, descending);

  if (year_sort_value === 0) {
    return smart_sort_func(month_a, month_b, descending);
  } else {
    return year_sort_value;
  }
};

const indicator_table_from_list = (indicator_list, subject, drr_key) => {
  const ind_map = _.chain(indicator_list)
    .map((ind) => [
      ind.indicator.id,
      {
        subject_link: subject_link(ind.parent_node),
        subject_full_name: `${ind.parent_node.data.name} ${text_maker(
          ind.parent_node.data.subject.subject_type === "program"
            ? ind.parent_node.data.subject.subject_type
            : "core_resp"
        )}`,
        id: ind.indicator.id,
        name: ind.indicator.name,
      },
    ])
    .fromPairs()
    .value();

  const column_configs = {
    cr_or_program: {
      index: 0,
      header: text_maker("cr_or_program"),
      is_searchable: true,
      formatter: (value) => ind_map[value].subject_link,
      plain_formatter: (value) => ind_map[value].subject_full_name,
    },
    indicator: {
      index: 1,
      header: text_maker("indicator"),
      is_searchable: true,
      formatter: (value) => {
        const indicator = Indicator.lookup(ind_map[value].id);

        return (
          <ModalButton
            title={text_maker("indicator_display_title")}
            button_text={indicator.name}
            aria_label={`${
              lang === "en" ? "Discover more about" : "Découvrir"
            } ${indicator.name}`}
            show_condition={{ name: "indicator", value: ind_map[value].id }}
          >
            <IndicatorDisplayPanel id={ind_map[value].id} subject={subject} />
          </ModalButton>
        );
      },
      plain_formatter: (value) => ind_map[value].name,
    },
    target: {
      index: 2,
      header: text_maker("target"),
      is_sortable: false,
    },
    target_result: {
      index: 3,
      header: text_maker("actual_result"),
      is_sortable: false,
    },
    date_to_achieve: {
      index: 4,
      header: text_maker("date_to_achieve"),
      formatter: format_date_to_achieve,
      plain_formatter: format_date_to_achieve,
      sort_func: sort_date_to_achieve,
    },
    status: {
      index: 5,
      header: text_maker("status"),
      formatter: (value) => (
        <Fragment>
          <span aria-hidden="true" className="copyable-hidden">
            {result_statuses[value].text}
          </span>
          {large_status_icons[value]}
        </Fragment>
      ),
      plain_formatter: (value) => result_statuses[value].text,
    },
  };

  const table_data = _.map(indicator_list, (ind) => ({
    cr_or_program: ind.indicator.id,
    indicator: ind.indicator.id,
    target: indicator_target_text(ind.indicator),
    target_result: indicator_actual_text(ind.indicator),
    date_to_achieve: get_date_to_achieve(ind.indicator),
    status: ind.indicator.status_key,
  }));
  return (
    <DisplayTable
      table_name={text_maker("result_flat_table_title", {
        year: get_drr_year(drr_key),
      })}
      data={table_data}
      column_configs={column_configs}
    />
  );
};

class ResultsTable extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      status_active_list: [],
    };
  }
  componentDidMount() {
    this.load_data();
  }
  componentDidUpdate(prevProps) {
    const { drr_key } = this.props;
    const { drr_key: previous_drr_key } = prevProps;

    if (drr_key !== previous_drr_key) {
      this.load_data();
    }
  }
  load_data = () => {
    const { subject, drr_key } = this.props;

    this.setState({ loading: true }, () =>
      ensure_loaded({
        subject,
        results: true,
        result_docs: [drr_key],
      }).then(() => this.setState({ loading: false }))
    );
  };
  render() {
    const { subject, subject_result_counts, drr_key } = this.props;
    const { loading, status_active_list } = this.state;

    if (loading) {
      return <LeafSpinner config_name={"subroute"} />;
    } else {
      const flat_indicators = get_indicators(subject, drr_key);
      const icon_counts = _.countBy(
        flat_indicators,
        ({ indicator }) => indicator.status_key
      );
      const filtered_indicators = _.filter(
        flat_indicators,
        (ind) =>
          _.isEmpty(status_active_list) ||
          _.includes(status_active_list, ind.indicator.status_key)
      );
      const toggle_status_status_key = (status_key) =>
        this.setState({
          status_active_list: toggle_list(status_active_list, status_key),
        });
      const clear_status_filter = () =>
        this.setState({ status_active_list: [] });

      return (
        <div>
          <div className="medium-panel-text">
            <TM
              k="result_flat_table_text"
              args={{
                subject,
                drr_total: subject_result_counts[`${drr_key}_total`],
                year: get_drr_year(drr_key),
              }}
            />
          </div>
          <div style={{ padding: "10px 10px" }}>
            <StatusIconTable
              active_list={status_active_list}
              icon_counts={icon_counts}
              onIconClick={toggle_status_status_key}
              onClearClick={clear_status_filter}
            />
          </div>
          <HeightClippedGraph clipHeight={200}>
            <div className="results-flat-table">
              {indicator_table_from_list(filtered_indicators, subject, drr_key)}
            </div>
          </HeightClippedGraph>
        </div>
      );
    }
  }
}

const DocTabbedResultsTable = ({
  subject,
  subject_result_counts,
  drr_keys_with_data,
}) => {
  const [drr_key, set_drr_key] = useState(_.last(drr_keys_with_data));

  const panel_content = (
    <ResultsTable
      subject={subject}
      subject_result_counts={subject_result_counts}
      drr_key={drr_key}
    />
  );

  if (drr_keys_with_data.length > 1) {
    return (
      <Tabs
        tabs={_.chain(drr_keys_with_data)
          .map((drr_key) => [drr_key, get_drr_year(drr_key)])
          .fromPairs()
          .value()}
        open_tab_key={drr_key}
        tab_open_callback={set_drr_key}
      >
        {panel_content}
      </Tabs>
    );
  } else {
    return panel_content;
  }
};

export const declare_results_table_panel = () =>
  declare_panel({
    panel_key: "results_flat_table",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      footnotes: ["RESULTS", "DRR"],
      depends_on: ["programSpending", "programFtes"],
      source: () => get_source_links(["DRR"]),
      requires_result_counts: subject_type === "dept",
      requires_granular_result_counts: subject_type !== "dept",
      title: (subject) => {
        const drr_keys_with_data = get_drr_keys_with_data(subject);

        return text_maker("result_flat_table_title", {
          first_year: get_drr_year(_.first(drr_keys_with_data)),
          last_year:
            drr_keys_with_data.length > 1 &&
            get_drr_year(_.last(drr_keys_with_data)),
        });
      },
      calculate(subject) {
        const subject_result_counts = get_subject_result_counts(subject);

        const drr_keys_with_data = get_drr_keys_with_data(subject);

        return (
          !_.isEmpty(drr_keys_with_data) && {
            drr_keys_with_data,
            subject_result_counts,
          }
        );
      },
      render({ title, calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: { drr_keys_with_data, subject_result_counts },
        } = calculations;

        return (
          <InfographicPanel {...{ title, sources, footnotes }}>
            <DocTabbedResultsTable
              {...{
                subject,
                subject_result_counts,
                drr_keys_with_data,
              }}
            />
          </InfographicPanel>
        );
      },
    }),
  });
