import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { SmartDisplayTable } from "src/components/index.js";

import * as Results from "src/models/results.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconArray } from "src/charts/IconArray.js";
import { StandardLegend } from "src/charts/legends/index.js";
import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import { toggle_list } from "src/general_utils.js";
import { get_source_links } from "src/metadata/data_sources.js";

import { TM, text_maker } from "./drr_summary_text.js";
import { large_status_icons } from "./result_components.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  GranularResultCounts,
  ordered_status_keys,
  filter_and_genericize_doc_counts,
  result_statuses,
  result_color_scale,
} from "./results_common.js";

import "./drr_summary.scss";

const { current_drr_key, result_docs } = Results;

const current_drr_year = result_docs[current_drr_key].year;
const current_drr_target_year =
  _.toNumber(result_docs[current_drr_key].year_short) + 1;

const grid_colors = {
  met: "results-icon-array-pass",
  not_met: "results-icon-array-fail",
  not_available: "results-icon-array-na",
  future: "results-icon-array-neutral",
};

const icon_order = _.chain(ordered_status_keys)
  .map((status_key, ix) => [status_key, ix * 5])
  .fromPairs()
  .value();

const MiniLegend = ({ items }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      fontSize: "0.87em",
      marginBottom: "5px",
    }}
  >
    {_.map(items, ({ label, id, className }) => (
      <div
        key={id}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "5px 15px 5px 0",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            marginRight: "5px",
          }}
          className={className}
          title={result_statuses[id].text}
        />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

// TODO: this could be a reusable chart, consider breaking it out at some point
const StatusGrid = (props) => {
  const max_size = 800;

  const { met, not_met, not_available, future } = props;

  const total = met + not_met + not_available + future;
  const shouldFactorDown = total > max_size;
  const icon_array_size_class = classNames(
    "IconArrayItem",
    total > 200 && "IconArrayItem__Small",
    total < 100 && "IconArrayItem__Large"
  );

  const is_single_indicator = _.some(props, (value) => value === total);

  const data = _.chain(props)
    .pickBy((val, key) => val > 0 || is_single_indicator)
    .toPairs()
    .groupBy(([key, val]) => key)
    .map((amounts, status_key) => {
      const key_total = _.sumBy(amounts, 1);
      return {
        status_key,
        viz_count: shouldFactorDown
          ? Math.ceil((key_total / total) * max_size)
          : key_total,
        real_count: key_total,
      };
    })
    .value();

  const viz_data = _.chain(data)
    .sortBy(({ status_key }) => icon_order[status_key])
    .flatMap(({ viz_count, status_key }) => {
      return _.range(0, viz_count).map(() => ({ status_key }));
    })
    .value();

  const legend_data = _.chain(data)
    .map(({ status_key }) => ({
      className: grid_colors[status_key],
      id: status_key,
      label: text_maker(status_key),
      order: icon_order[status_key],
    }))
    .sortBy("order")
    .value();

  if (is_a11y_mode) {
    const a11y_data = _.map(data, ({ status_key, real_count }) => ({
      label: text_maker(status_key),
      real_count,
    }));
    return (
      <SmartDisplayTable
        data={a11y_data}
        column_configs={{
          label: {
            index: 0,
            header: text_maker("status"),
          },
          real_count: {
            index: 1,
            formatter: "big_int",
            header: text_maker("results_icon_array_title", {
              year: current_drr_year,
            }),
          },
        }}
      />
    );
  }

  return (
    <div>
      <div>
        <MiniLegend items={legend_data} />
        <div style={{ marginTop: "3rem" }}>
          {_.chain(viz_data)
            .groupBy("status_key")
            .map((group, status_key) => [group, status_key])
            .sortBy(([group, status_key]) => icon_order[status_key])
            .map(([group, status_key]) => (
              <IconArray
                key={status_key}
                items={group}
                render_item={({ status_key }) => (
                  <div
                    className={classNames(
                      icon_array_size_class,
                      grid_colors[status_key]
                    )}
                    title={result_statuses[status_key].text}
                  />
                )}
              />
            ))
            .value()}
        </div>
      </div>
    </div>
  );
};

class PercentageViz extends React.Component {
  constructor(props) {
    super(props);
    const { counts } = this.props;

    const all_ids = _.keys(counts);
    const present_ids = _.chain(counts)
      .toPairs()
      .filter((count) => count[1] !== 0)
      .fromPairs()
      .value();

    const default_selected =
      _.reject(present_ids, (value, key) => key === "future").length > 0 &&
      !is_a11y_mode
        ? _.without(all_ids, "future")
        : all_ids;

    this.state = {
      selected: default_selected,
    };
  }

  render() {
    const { counts } = this.props;
    const { selected } = this.state;

    const all_data = _.chain(counts)
      .map((value, key) => ({
        label: result_statuses[key].text,
        id: key,
        value,
      }))
      .filter((status) => status.value > 0)
      .value();

    const all_data_total = _.sumBy(all_data, "value");

    const graph_data = _.filter(all_data, ({ id }) => _.includes(selected, id));

    const graph_total = _.sumBy(graph_data, "value");
    const colors = ({ id }) => result_color_scale(id);

    const new_summary_text_args = {
      year: current_drr_year,
      drr_subset: graph_total,
      drr_total: all_data_total,
      drr_indicators_met: _.includes(selected, "met") && counts.met,
      drr_indicators_not_met: _.includes(selected, "not_met") && counts.not_met,
      drr_indicators_not_available:
        _.includes(selected, "not_available") && counts.not_available,
      drr_indicators_future: _.includes(selected, "future") && counts.future,
    };

    return (
      <Fragment>
        <div className="row">
          <div className="col-12 col-lg-1 " />
          <div
            className="col-12 col-lg-4 "
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
            }}
          >
            {!is_a11y_mode && (
              <StandardLegend
                items={_.chain(all_data)
                  .map(({ label, id }) => ({
                    label: label,
                    active: _.includes(selected, id),
                    id,
                    color: result_color_scale(id),
                  }))
                  .value()}
                onClick={(id) => {
                  !(selected.length === 1 && selected.includes(id)) &&
                    this.setState({
                      selected: toggle_list(selected, id),
                    });
                }}
              />
            )}
            <div
              className="standard-legend-container"
              style={{ margin: "5px 0px" }}
            >
              <TM k="drr_summary_stats" args={new_summary_text_args} />
            </div>
          </div>
          <div className="col-12 col-lg-1 " />
          <div className="col-12 col-lg-6  medium-panel-text">
            <WrappedNivoPie
              data={graph_data}
              graph_height="300px"
              is_money={false}
              colors={colors}
              margin={{
                top: 30,
                right: 30,
                bottom: 30,
                left: 30,
              }}
              show_legend={false}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export const DrrSummary = ({
  subject,
  counts,
  verbose_counts,
  is_gov,
  num_depts,
}) => {
  const current_drr_counts_with_generic_keys = filter_and_genericize_doc_counts(
    verbose_counts,
    current_drr_key
  );

  const summary_text_args = {
    subject,
    num_depts,
    is_gov,
    year: current_drr_year,
    target_year: current_drr_target_year,
    ...current_drr_counts_with_generic_keys,
  };

  return (
    <Fragment>
      <div className="row align-items-center justify-content-lg-between">
        <div className="col-12 medium-panel-text">
          <TM k="drr_summary_text_intro" args={summary_text_args} />
        </div>
      </div>
      <div className="row align-items-center justify-content-lg-between">
        <div className="col-12 col-lg-7  medium-panel-text">
          <div style={{ padding: "10px" }}>
            <TM k="result_status_explanation" />
            <table>
              <tbody>
                {_.map(ordered_status_keys, (status) => (
                  <tr key={status}>
                    <td style={{ padding: "10px" }}>
                      {large_status_icons[status]}
                    </td>
                    <td>
                      <TM k={`result_status_explanation_${status}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-12 col-lg-5 ">
          <div style={{ padding: "30px" }}>
            <StatusGrid {...counts} />
          </div>
        </div>
      </div>
      <div className="panel-separator" style={{ marginTop: "0px" }} />
      <div className="row align-items-center justify-content-lg-between">
        <div className={"col-12"}>
          <PercentageViz
            summary_text_args={summary_text_args}
            counts={counts}
          />
        </div>
      </div>
    </Fragment>
  );
};

const render = ({ title, calculations, footnotes, sources }) => {
  const { panel_args, subject } = calculations;

  return (
    <InfographicPanel {...{ title, footnotes, sources }}>
      <DrrSummary subject={subject} {...panel_args} />
    </InfographicPanel>
  );
};

export const declare_drr_summary_panel = () =>
  declare_panel({
    panel_key: "drr_summary",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      requires_result_counts: level === "dept",
      requires_granular_result_counts: level !== "dept",
      footnotes: ["RESULTS_COUNTS", "RESULTS"],
      source: (subject) => get_source_links(["DRR"]),
      title: text_maker("drr_summary_title", { year: current_drr_year }),
      calculate(subject) {
        const verbose_counts = (() => {
          switch (level) {
            case "dept":
              return ResultCounts.get_dept_counts(subject.id);
            case "crso":
              return _([subject.id, ..._.map(subject.programs, "id")])
                .map((id) => GranularResultCounts.get_subject_counts(id))
                .reduce(
                  (accumulator, counts) =>
                    _.mergeWith(accumulator, counts, _.add),
                  {}
                );
            case "program":
              return GranularResultCounts.get_subject_counts(subject.id);
          }
        })();

        const counts = row_to_drr_status_counts(
          verbose_counts,
          current_drr_key
        );

        if (verbose_counts[`${current_drr_key}_total`] < 1) {
          return false;
        }

        return {
          verbose_counts,
          counts,
        };
      },
      render,
    }),
  });
