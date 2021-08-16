import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { DisplayTable, Format } from "src/components/index";

import { newIBCategoryColors } from "src/core/color_schemes";

import { TabularLegend } from "src/charts/legends";

import {
  InteractiveGraph,
  create_text_maker_component_with_nivo_common,
  general_default_props,
  get_formatter,
} from "src/charts/wrapped_nivo/wrapped_nivo_common";

import text from "./CircleProportionGraph.yaml";

import "./CircleProportionGraph.scss";

const { text_maker, TM } = create_text_maker_component_with_nivo_common(text);

export class CircleProportionGraph extends React.Component {
  render() {
    const {
      is_money,
      formatter,
      height,
      child_value,
      child_name,
      parent_value,
      parent_name,
      disable_table_view,
      table_name,
    } = this.props;

    const color_scale = scaleOrdinal().range(newIBCategoryColors);
    const value_formatter = get_formatter(is_money, formatter, true, false);

    const Circles = () => {
      const viewbox_dimension = 180;
      const parent_radius = viewbox_dimension / 2;
      const parent_cx = viewbox_dimension / 2;
      const parent_cy = viewbox_dimension / 2;

      const child_radius = _.max([
        parent_radius * Math.sqrt(child_value / parent_value),
        viewbox_dimension * 0.01, // roughly the smallest visible child radius
      ]);

      // this y position will place the bottom of the inner circle just barely above the bottom of the outer circle.
      // Easier to judge proptions than when it's centered, and the slight offset stops the the svg's edges from
      // overlaping and looking jagged
      const child_cy = parent_cy + parent_radius - child_radius - 1;

      return (
        <div
          style={{
            height: viewbox_dimension,
            width: viewbox_dimension,
            margin: "auto",
          }}
        >
          <svg viewBox={`0 0 ${viewbox_dimension} ${viewbox_dimension}`}>
            <circle
              cx={parent_cx}
              cy={parent_cy}
              r={parent_radius}
              fill={color_scale(parent_name)}
            />
            <circle
              cx={parent_cx}
              cy={child_cy}
              r={child_radius}
              fill={color_scale(child_name)}
            />
          </svg>
        </div>
      );
    };

    const legend_items = [
      {
        id: parent_name,
        label: parent_name,
        color: color_scale(parent_name),
        value: parent_value,
      },
      {
        id: child_name,
        label: child_name,
        color: color_scale(child_name),
        value: child_value,
      },
    ];

    const graph = (
      <Fragment>
        <div style={{ height: height }}>
          <Circles />
        </div>
        <div style={{ textAlign: "center" }}>
          <TM
            k={"bubble_title"}
            args={{ outer: parent_name, inner: child_name }}
          />
        </div>
        <TabularLegend
          items={legend_items}
          get_right_content={(item) => (
            <div>
              <span className="infobase-pie__legend-data">
                {value_formatter(item.value)}
              </span>
              {
                <span className="infobase-pie__legend-data">
                  <Format
                    type="percentage1"
                    content={item.value / parent_value}
                  />
                </span>
              }
            </div>
          )}
        />
      </Fragment>
    );

    const column_configs = _.chain(["label", "value"])
      .map((key, idx) => [
        key,
        {
          index: idx,
          header: text_maker(key),
          formatter: (value) =>
            _.isUndefined(value) ? "" : value_formatter(value),
        },
      ])
      .fromPairs()
      .value();
    const table_data = [
      { label: parent_name, value: parent_value },
      { label: child_name, value: child_value },
    ];
    const table = !disable_table_view && (
      <DisplayTable
        table_name={table_name || text_maker("default_table_name")}
        column_configs={column_configs}
        data={table_data}
      />
    );

    return <InteractiveGraph graph={graph} table={table} />;
  }
}
CircleProportionGraph.defaultProps = {
  ...general_default_props,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};
