import { ResponsiveBubble } from "@nivo/circle-packing";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import MediaQuery from "react-responsive";

import { SmartDisplayTable } from "src/components/index.js";

import { breakpoints } from "src/core/breakpoint_defs.ts";

import { textColor } from "src/core/color_defs.ts";

import { newIBCategoryColors } from "src/core/color_schemes.ts";

import { formats } from "src/core/format.ts";

import {
  InteractiveGraph,
  create_text_maker_component_with_nivo_common,
  general_default_props,
  get_formatter,
  TooltipFactory,
} from "./wrapped_nivo_common.js";

import text from "./WrappedNivoCircleProportion.yaml";
import "./WrappedNivoCircleProportion.scss";

const { text_maker, TM } = create_text_maker_component_with_nivo_common(text);

// Hacky abuse of ResponsiveBubble... very fragile against nivo changes. Bonus comments left in this file to balance against that
// Would be trivial to make this graph ourselves, only reason for doing it like this is to get nivo native tooltips (and even
// then they're extra customized ones) and our common nivo graph utilities ...consider rethinking this though

const MIN_NODE_RADIUS = 2;
const ProportionalNode = ({ node, style, handlers }) => {
  if (style.r <= 0) {
    return null;
  }

  const {
    // note these aren't values for the specific node, but for the whole graph, e.g. r is always the outer circle radius,
    // and (x, y) is the center of the graph. Node specific values are calculated below
    r: graph_radius,
    x: center_x,
    y: center_y,

    fill,
    color,
    borderColor,
    borderWidth,
  } = style;

  const { node_radius, node_x, node_y } = (() => {
    if (_.isNull(node.parent)) {
      return {
        node_radius: graph_radius,
        node_x: center_x,
        node_y: center_y,
      };
    } else {
      // need to be clear here, node.value !== graph_data.value as seen below. The config data from graph_data is stored in
      // node.data. The value in node.value is node.data.value PLUS the sum of child values
      // ... kind of makes sense for the standard use of this graph, but still a bit of annoying hidden logic. Makes what
      // we're doing here extra hacky
      const proportion_ratio = node.value / node.parent.value;

      const node_radius = _.max([
        graph_radius * Math.sqrt(proportion_ratio), // do the math, make the actual area proportional
        MIN_NODE_RADIUS,
      ]);

      // this y position will place the bottom of the inner circle just barely above the bottom of the outer circle.
      // Easier to judge proptions than when it's centered, and the slight offset stops the the svg's edges from
      // overlaping and looking jagged
      const node_y = center_y + (graph_radius - node_radius) - 1;

      return {
        node_radius,
        node_x: center_x,
        node_y,
      };
    }
  })();

  return (
    <g transform={`translate(${node_x},${node_y})`}>
      <circle
        r={node_radius}
        {...handlers}
        fill={fill ? fill : color}
        stroke={borderColor}
        strokeWidth={borderWidth}
        shapeRendering={"geometricPrecision"}
      />
    </g>
  );
};

export class WrappedNivoCircleProportion extends React.Component {
  render() {
    const {
      margin,
      is_money,
      formatter,
      labelSkipWidth,
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

    const graph_data = {
      id: parent_name,
      name: parent_name,
      // ... nivo bubble will roll child values back up and add them to the parent value for use in the graph
      // so we need to remove the inner portion from the total here
      value: parent_value - child_value,
      color: color_scale(parent_name),
      children: child_value
        ? [
            {
              id: child_name,
              name: child_name,
              value: child_value,
              color: color_scale(child_name),
            },
          ]
        : 0,
    };

    const tooltip = () => (
      <TooltipFactory
        tooltip_items={[
          {
            id: "parent",
            name: parent_name,
            value: parent_value,
            shape: "circle",
            color: color_scale(parent_name),
          },
          {
            id: "child",
            name: child_name,
            value: child_value,
            shape: "circle",
            color: color_scale(child_name),
          },
        ]}
        tooltip_container_class="proportional-bubble-tooltip"
        TooltipContentComponent={({ tooltip_item }) => (
          <Fragment>
            <MediaQuery minDeviceWidth={breakpoints.minMediumDevice}>
              <td className="nivo-tooltip__label">{tooltip_item.name}</td>
              <td className="nivo-tooltip__value">
                {value_formatter(tooltip_item.value)}
              </td>
              <td className="nivo-tooltip__value">
                {`(${formats.smart_percentage1_raw(
                  tooltip_item.value / parent_value
                )})`}
              </td>
            </MediaQuery>
            <MediaQuery maxDeviceWidth={breakpoints.maxMediumDevice}>
              <td>
                <div className="nivo-tooltip__label ">{tooltip_item.name}</div>
                <div className="nivo-tooltip__value">
                  {value_formatter(tooltip_item.value)}
                </div>
                <div className="nivo-tooltip__value">
                  {`(${formats.smart_percentage1_raw(
                    tooltip_item.value / parent_value
                  )})`}
                </div>
              </td>
            </MediaQuery>
          </Fragment>
        )}
      />
    );

    const graph = (
      <Fragment>
        <div style={{ height: height }}>
          <ResponsiveBubble
            root={graph_data}
            identity="name"
            value="value"
            colors={(d) => color_scale(d.name)}
            borderColor="inherit:darker(1.6)"
            borderWidth={0}
            enableLabel={false}
            labelTextColor={textColor}
            labelSkipWidth={labelSkipWidth}
            animate={true}
            motionStiffness={90}
            motionDamping={12}
            leavesOnly={false}
            padding={0}
            nodeComponent={ProportionalNode}
            margin={margin}
            tooltip={tooltip}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <TM
            k={"bubble_title"}
            args={{ outer: parent_name, inner: child_name }}
          />
        </div>
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
      <SmartDisplayTable
        unsorted_initial={true}
        table_name={table_name || text_maker("default_table_name")}
        column_configs={column_configs}
        data={table_data}
      />
    );

    return <InteractiveGraph graph={graph} table={table} />;
  }
}
WrappedNivoCircleProportion.defaultProps = {
  ...general_default_props,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};
