import { ResponsivePie } from "@nivo/pie";
import classNames from "classnames";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { Format, SmartDisplayTable } from "src/components/index.js";

import { newIBCategoryColors } from "src/core/color_schemes.js";

import { formats } from "src/core/format.js";

import { TabularLegend } from "../legends";

import {
  nivo_common_text_maker,
  InteractiveGraph,
  general_default_props,
  infobase_colors_smart,
  get_formatter,
} from "./wrapped_nivo_common.js";

import "./WrappedNivoPie.scss";

export class WrappedNivoPie extends React.Component {
  render() {
    const {
      data,
      graph_height,
      colors,
      include_percent,
      tooltip,
      percent_value_tooltip,
      is_money,
      text_formatter,
      margin,
      display_horizontal,
      disable_table_view,
      table_name,
      show_legend,
      theme,
    } = this.props;

    const color_scale = infobase_colors_smart(
      scaleOrdinal().range(colors || newIBCategoryColors)
    );
    const color_func = colors || ((d) => color_scale(d.label));

    const legend_items = _.chain(data)
      .sortBy("value")
      .reverse()
      .map(({ value, label }) => ({
        value,
        label,
        color: color_scale(label),
        id: label,
      }))
      .value();

    const data_with_absolute_values = _.map(data, (data) => ({
      ...data,
      value: Math.abs(data.value),
      original_value: data.value,
    }));

    const graph_total = _.reduce(
      data,
      (sum, { value }) => sum + Math.abs(value),
      0
    );

    const table_data = _.map(data, (row) => ({
      label: row.label,
      percentage: row.value / graph_total,
      value: row.value,
    }));
    const column_configs = {
      label: {
        index: 0,
        header: nivo_common_text_maker("label"),
        is_searchable: true,
      },
      value: {
        index: 1,
        header: nivo_common_text_maker("value"),
        formatter: (value) =>
          value
            ? get_formatter(is_money, text_formatter, true, false)(value)
            : "",
      },
      percentage: {
        index: 2,
        header: nivo_common_text_maker("percentage"),
        formatter: (value) => formats.percentage_raw(value),
      },
    };

    const table = !disable_table_view && (
      <SmartDisplayTable
        data={table_data}
        column_configs={column_configs}
        table_name={table_name || nivo_common_text_maker("default_table_name")}
      />
    );

    const graph = (
      <div
        className={classNames(
          "infobase-pie",
          display_horizontal && "infobase-pie--horizontal"
        )}
        aria-hidden={true}
      >
        <div className="infobase-pie__graph" style={{ height: graph_height }}>
          <ResponsivePie
            {...{
              data: data_with_absolute_values,
              margin,
              theme,
            }}
            colors={color_func}
            tooltip={({ datum }) => {
              const data_with_original_values = {
                ...datum,
                value: datum.data.original_value,
              };

              if (include_percent) {
                return percent_value_tooltip(
                  [data_with_original_values],
                  get_formatter(is_money, text_formatter, false),
                  _.sumBy(data_with_absolute_values, "value")
                );
              } else {
                return tooltip(
                  [data_with_original_values],
                  get_formatter(is_money, text_formatter, false)
                );
              }
            }}
            innerRadius={0.5}
            animate={false}
            borderWidth={0}
            enableSliceLabels={false}
            enableRadialLabels={false}
          />
        </div>
        <div className="infobase-pie__legend">
          <div className="centerer">
            <div className="centerer-IE-fix">
              {show_legend && (
                <TabularLegend
                  items={legend_items}
                  get_right_content={(item) => (
                    <div>
                      <span className="infobase-pie__legend-data">
                        <Format type="compact1" content={item.value} />
                      </span>
                      <span className="infobase-pie__legend-data">
                        <Format
                          type="percentage1"
                          content={item.value / graph_total}
                        />
                      </span>
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <InteractiveGraph graph={graph} table={table} table_name={table_name} />
    );
  }
}
WrappedNivoPie.defaultProps = {
  ...general_default_props,
  margin: {
    top: 30,
    right: 80,
    bottom: 60,
    left: 50,
  },
  theme: {
    tooltip: {
      boxShadow: "rgb(0 0 0 / 25%) 0px 1px 2px",
    },
  },
  include_percent: true,
  show_legend: true,
};
