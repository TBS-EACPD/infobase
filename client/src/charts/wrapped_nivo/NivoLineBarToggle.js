import classNames from "classnames";

import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { create_text_maker } from "src/models/text.js";

import { newIBCategoryColors } from "src/core/color_schemes.js";
import { formats } from "src/core/format.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { StandardLegend } from "src/charts/legends/index.js";
import { toggle_list } from "src/general_utils.js";

import { WrappedNivoBar } from "././wrapped_nivo_bar.js";
import { infobase_colors_smart } from "./wrapped_nivo_common.js";
import { WrappedNivoLine } from "./WrappedNivoLine.js";

import text from "./NivoLineBarToggle.yaml";

const text_maker = create_text_maker(text);

export class NivoLineBarToggle extends React.Component {
  constructor(props) {
    super(props);

    this.extra_options_by_graph_mode = {
      bar_stacked: {
        bar: true,
        index: "date",
        groupMode: "stacked",
      },
      bar_normalized: {
        bar: true,
        normalized: true,
        formatter: formats.percentage1,
        groupMode: "stacked",
        index: "date",
      },
      bar_grouped: {
        bar: true,
        groupMode: "grouped",
        index: "date",
      },
      line: {
        bar: false,
        stacked: false,
      },
      line_stacked: {
        bar: false,
        stacked: true,
        enableArea: true,
      },
    };
    this.graph_modes = _.keys(this.extra_options_by_graph_mode);

    const colors = props.colors || props.get_colors();

    // d3 categorical scales memoize data --> color mappings
    // so this ensures that the mapping will be the same for
    // each sub-graph
    const set_graph_colors = (items) =>
      _.each(items, (item) => colors(item.label));
    set_graph_colors(props.data);

    this.state = {
      colors,
      selected: _.chain(props.data)
        .filter(({ active }) => _.isUndefined(active) || active)
        .map(({ label }) => label)
        .value(),
      graph_mode: props.initial_graph_mode,
    };
  }
  render() {
    const {
      data,

      legend_col_full_size,
      legend_col_class,
      legend_title,

      graph_col_full_size,
      graph_col_class,

      disable_toggle,
      formatter,
      graph_options,
    } = this.props;

    const { colors, selected, graph_mode, y_scale_zoomed } = this.state;

    const extra_graph_options = this.extra_options_by_graph_mode[graph_mode];

    const series = _.chain(data)
      .filter(({ label }) => _.includes(selected, label))
      .map(({ label, data }) => [label, data])
      .fromPairs()
      .value();

    const raw_data = _.flatMap(series, (value) => value);

    const data_bar = _.map(graph_options.ticks, (date, date_index) => ({
      ..._.chain(series)
        .map((data, label) => [label, data[date_index]])
        .fromPairs()
        .value(),
    }));

    const data_formatter_bar = (data) =>
      _.map(data, (stacked_data, index) => ({
        ...stacked_data,
        date: graph_options.ticks[index],
      }));

    const normalize = (data) =>
      _.map(data, (series) => {
        const series_total = _.reduce(series, (sum, value) => sum + value, 0);
        return _.chain(series)
          .map((value, label) => [label, value / series_total])
          .fromPairs()
          .value();
      });

    const data_formatter_line = _.map(series, (data_array, data_label) => ({
      id: data_label,
      data: _.map(data_array, (spending_value, tick_index) => ({
        x: graph_options.ticks[tick_index],
        y: spending_value,
      })),
    }));

    const extended_graph_options_bar = {
      keys: Object.keys(series),
      data: extra_graph_options.normalized
        ? data_formatter_bar(normalize(data_bar))
        : data_formatter_bar(data_bar),
      colors: (d) => colors(d.id),
      text_formatter: formatter || extra_graph_options.formatter,
      indexBy: extra_graph_options.index,
      is_money: !!extra_graph_options.is_money,
      groupMode: extra_graph_options.groupMode,
      raw_data,
      margin: {
        top: 30,
        right: 20,
        bottom: 65,
        left: 65,
      },
      bttm_axis: {
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      },
    };

    const extended_graph_options_line = {
      data: data_formatter_line,
      colors: (d) => colors(d.id),
      raw_data,
      yScale: {
        type: "linear",
        zoomed: y_scale_zoomed,
      },
      enableArea: !!extra_graph_options.enableArea,
      stacked: !!extra_graph_options.stacked,
      is_money: !!extra_graph_options.is_money,
      text_formatter: formatter || extra_graph_options.formatter,
      margin: {
        top: 30,
        right: 20,
        bottom: 65,
        left: 65,
      },
      bttm_axis: {
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      },
    };

    return (
      <div className="frow">
        {!is_a11y_mode && (
          <div
            className={classNames(
              `fcol-xs-12 fcol-md-${legend_col_full_size}`,
              legend_col_class
            )}
            style={{ width: "100%", position: "relative" }}
          >
            <StandardLegend
              title={legend_title}
              items={_.map(data, ({ label }) => ({
                label,
                active: _.includes(selected, label),
                id: label,
                color: colors(label),
              }))}
              onClick={(label) => {
                !(selected.length === 1 && selected.includes(label)) &&
                  this.setState({
                    selected: toggle_list(selected, label),
                  });
              }}
              Controls={
                !disable_toggle && (
                  <button
                    className="btn-ib-primary"
                    onClick={() => {
                      const current_mode_index = _.indexOf(
                        this.graph_modes,
                        graph_mode
                      );
                      const name_of_next_graph_mode = this.graph_modes[
                        (current_mode_index + 1) % this.graph_modes.length
                      ];
                      this.setState({
                        graph_mode: name_of_next_graph_mode,
                      });
                    }}
                  >
                    {text_maker("toggle_graph")}
                  </button>
                )
              }
            />
          </div>
        )}
        <div
          className={classNames(
            `fcol-xs-12 fcol-md-${graph_col_full_size}`,
            graph_col_class
          )}
          style={{ width: "100%", position: "relative" }}
          tabIndex="-1"
        >
          {extra_graph_options.bar ? (
            <WrappedNivoBar {...extended_graph_options_bar} />
          ) : (
            <WrappedNivoLine {...extended_graph_options_line} />
          )}
        </div>
      </div>
    );
  }
}
NivoLineBarToggle.defaultProps = {
  legend_col_full_size: 4,
  graph_col_full_size: 8,
  legend_class: false,
  graph_col_class: false,
  get_colors: () =>
    infobase_colors_smart(scaleOrdinal().range(newIBCategoryColors)),
  initial_graph_mode: "bar_stacked",
};
