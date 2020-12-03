import { Fragment } from "react";

import { ModalButton } from "src/components/index.js";

import { Indicator } from "src/models/results.js";

import { lang } from "src/app_bootstrap/globals.js";

import { businessConstants } from "../../../models/businessConstants.js";
import {
  util_components,
  InfographicPanel,
  ensure_loaded,
  infograph_href_template,
  get_source_links,
  Results,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";

import IndicatorDisplayPanel from "./IndicatorDisplayPanel";

import { StatusIconTable, large_status_icons } from "./result_components.js";

import { create_full_results_hierarchy } from "./result_drilldown/result_hierarchies.js";
import { TM, text_maker } from "./result_text_provider.js";
import {
  ResultCounts,
  GranularResultCounts,
  result_docs,
  result_statuses,
  indicator_text_functions,
} from "./results_common.js";

import "./result_flat_table.scss";

const {
  SpinnerWrapper,
  SmartDisplayTable,
  sort_func_template,
} = util_components;

const { current_drr_key } = Results;
const { months } = businessConstants;

const {
  indicator_target_text,
  indicator_actual_text,
} = indicator_text_functions;

const current_drr_year = result_docs[current_drr_key].year;

const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {
    id: indicator_node.parent_id,
  });
  if (_.includes(["cr", "program"], parent.data.type)) {
    return parent;
  } else if (parent.data.type === "dr" || parent.data.type === "result") {
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    throw `Result component ${indicator_node} has no (sub)program or CR parent`;
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
    <a href={infograph_href_template(node.data.subject, "results")}>
      {node.data.name}
    </a>
    <span className="text-nowrap">
      {" "}
      (
      {text_maker(
        node.data.subject.level === "program"
          ? node.data.subject.level
          : "core_resp"
      )}
      )
    </span>
  </span>
);

const date_as_number = (value) => {
  const time = new Date(value).getTime();
  return _.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

const indicator_table_from_list = (indicator_list, subject) => {
  const ind_map = _.chain(indicator_list)
    .map((ind) => [
      ind.indicator.id,
      {
        subject_link: subject_link(ind.parent_node),
        subject_full_name: `${ind.parent_node.data.name} 
        ${text_maker(
          ind.parent_node.data.subject.level === "program"
            ? ind.parent_node.data.subject.level
            : "core_resp"
        )}`,
        id: ind.indicator.id,
        name: ind.indicator.name,
      },
    ])
    .fromPairs()
    .value();
  const fmt_plain_string_date = (date_obj) =>
    _.isDate(date_obj)
      ? `${months[date_obj.getMonth() + 1].text} ${date_obj.getFullYear()}`
      : date_obj;

  const column_configs = {
    cr_or_program: {
      index: 0,
      header: text_maker("cr_or_program"),
      is_searchable: true,
      formatter: (value) => ind_map[value].subject_link,
      raw_formatter: (value) => ind_map[value].subject_full_name,
      sort_func: (a, b) => {
        if (a && b) {
          const a_name = ind_map[a].subject_full_name.toUpperCase();
          const b_name = ind_map[b].subject_full_name.toUpperCase();
          return sort_func_template(a_name, b_name);
        }
        return 0;
      },
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
      sort_func: (a, b) => {
        if (a && b) {
          const a_name = ind_map[a].name.toUpperCase();
          const b_name = ind_map[b].name.toUpperCase();
          return sort_func_template(a_name, b_name);
        }
        return 0;
      },
      raw_formatter: (value) => ind_map[value].name,
    },
    target: {
      index: 2,
      header: text_maker("target"),
      is_sortable: false,
    },
    target_result: {
      index: 3,
      header: text_maker("target_result"),
      is_sortable: false,
    },
    date_to_achieve: {
      index: 4,
      header: text_maker("date_to_achieve"),
      formatter: (val) => fmt_plain_string_date(val),
      raw_formatter: (val) => fmt_plain_string_date(val),
      sort_func: (a, b) => {
        if (a && b) {
          const a_time = date_as_number(a);
          const b_time = date_as_number(b);
          return sort_func_template(a_time, b_time);
        }
        return 0;
      },
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
      raw_formatter: (value) => result_statuses[value].text,
    },
  };

  const get_indicator_date = ({ target_year, target_month }) => {
    if (_.isNumber(target_month) && _.isNumber(target_year)) {
      return new Date(target_year, target_month);
    } else if (_.isNumber(target_year)) {
      return target_year;
    } else if (_.nonEmpty(target_year)) {
      return text_maker(target_year);
    } else {
      return text_maker("unspecified");
    }
  };

  const table_data = _.map(indicator_list, (ind) => ({
    cr_or_program: ind.indicator.id,
    indicator: ind.indicator.id,
    target: indicator_target_text(ind.indicator),
    target_result: indicator_actual_text(ind.indicator),
    date_to_achieve: get_indicator_date(ind.indicator),
    status: ind.indicator.status_key,
  }));
  return (
    <SmartDisplayTable
      table_name={text_maker("result_flat_table_title", {
        year: current_drr_year,
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
    const { subject, last_drr_doc } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: [last_drr_doc],
    }).then(() => this.setState({ loading: false }));
  }
  render() {
    const { subject, subject_result_counts, last_drr_doc } = this.props;
    const { loading, status_active_list } = this.state;

    if (loading) {
      return (
        <div
          style={{
            position: "relative",
            height: "80px",
            marginBottom: "-10px",
          }}
        >
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const flat_indicators = get_indicators(subject, last_drr_doc);
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
          status_active_list: _.toggle_list(status_active_list, status_key),
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
                drr_total: subject_result_counts[`${current_drr_key}_total`],
                year: current_drr_year,
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
              {indicator_table_from_list(filtered_indicators, subject)}
            </div>
          </HeightClippedGraph>
        </div>
      );
    }
  }
}

export const declare_results_table_panel = () =>
  declare_panel({
    panel_key: "results_flat_table",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["DRR"],
      depends_on: ["programSpending", "programFtes"],
      source: (subject) => get_source_links(["DRR"]),
      requires_result_counts: level === "dept",
      requires_granular_result_counts: level !== "dept",
      calculate(subject) {
        const subject_result_counts =
          level === "dept"
            ? ResultCounts.get_dept_counts(subject.id)
            : GranularResultCounts.get_subject_counts(subject.id);

        const had_doc_data = (doc) => {
          const count_key = `${doc}_total`;
          return (
            /drr/.test(doc) &&
            !_.isUndefined(subject_result_counts) &&
            !_.isNull(subject_result_counts[count_key]) &&
            subject_result_counts[count_key] > 0
          );
        };

        const docs_with_data = _.chain(result_docs)
          .keys()
          .filter(had_doc_data)
          .value();

        const last_drr_doc = _.chain(docs_with_data).sort().last().value();

        if (_.isEmpty(docs_with_data)) {
          return false;
        }

        return { docs_with_data, subject_result_counts, last_drr_doc };
      },

      render({ calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: { docs_with_data, last_drr_doc, subject_result_counts },
        } = calculations;

        return (
          <InfographicPanel
            title={text_maker("result_flat_table_title", {
              year: current_drr_year,
            })}
            sources={sources}
            footnotes={footnotes}
          >
            <ResultsTable
              {...{
                subject,
                docs_with_data,
                last_drr_doc,
                subject_result_counts,
              }}
            />
          </InfographicPanel>
        );
      },
    }),
  });
