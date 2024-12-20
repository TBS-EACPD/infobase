import { ResponsivePie } from "@nivo/pie";
import classNames from "classnames";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { Format, DisplayTable } from "src/components/index";

import { newIBCategoryColors } from "src/core/color_schemes";
import { formats, get_formatter } from "src/core/format";

import { TabularLegend } from "src/charts/legends/index";

import {
  nivo_common_text_maker,
  InteractiveGraph,
  general_default_props,
} from "src/charts/wrapped_nivo/wrapped_nivo_common";

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
      sort_legend,
      reverse_layout,
      custom_legend_items,
      id,
    } = this.props;

    const color_scale = scaleOrdinal().range(colors || newIBCategoryColors);
    const color_func = colors || ((d) => color_scale(d.label));

    const legend_items =
      custom_legend_items ||
      _.chain(data)
        .map(({ value, label }) => ({
          value,
          label,
          color: color_scale(label),
          id: label,
        }))
        .thru((data) =>
          sort_legend ? _.chain(data).sortBy("value").reverse().value() : data
        )
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
    const value_formatter = get_formatter(
      is_money,
      text_formatter,
      true,
      false
    );
    const column_configs = {
      label: {
        index: 0,
        header: nivo_common_text_maker("label"),
        is_searchable: true,
      },
      value: {
        index: 1,
        header: nivo_common_text_maker("value"),
        formatter: (value) => (value ? value_formatter(value) : ""),
      },
      percentage: {
        index: 2,
        header: nivo_common_text_maker("percentage"),
        formatter: (value) => formats.percentage1_raw(value),
      },
    };

    const table = !disable_table_view && (
      <DisplayTable
        data={table_data}
        column_configs={column_configs}
        table_name={table_name || nivo_common_text_maker("default_table_name")}
      />
    );

    const graph = (
      <div
        className={classNames(
          "infobase-pie",
          display_horizontal && "infobase-pie--horizontal",
          reverse_layout && "infobase-pie--reverse"
        )}
        aria-hidden={true}
      >
        <div className="infobase-pie__graph" style={{ height: graph_height }}>
          <ResponsivePie
            {...{
              data: data_with_absolute_values,
              margin,
              theme,
              id,
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
                  _.sumBy(this.props.data, "value")
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
            enableArcLabels={false}
            enableArcLinkLabels={false}
          />
        </div>
        {show_legend && (
          <div className="infobase-pie__legend">
            <TabularLegend
              items={legend_items}
              get_right_content={(item) => (
                <div>
                  <span className="infobase-pie__legend-data">
                    {value_formatter(item.value)}
                  </span>
                  {include_percent && (
                    <span className="infobase-pie__legend-data">
                      <Format
                        type="percentage1"
                        content={item.value / graph_total || 0}
                      />
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        )}
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
  sort_legend: true,
  reverse_layout: false,
  id: "id",
};
