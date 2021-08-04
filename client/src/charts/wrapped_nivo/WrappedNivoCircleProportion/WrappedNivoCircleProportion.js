import {
  ResponsiveCirclePacking,
  useNodeMouseHandlers,
} from "@nivo/circle-packing";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import MediaQuery from "react-responsive";

import { DisplayTable } from "src/components/index";

import { newIBCategoryColors } from "src/core/color_schemes";

import { formats } from "src/core/format";

import {
  InteractiveGraph,
  create_text_maker_component_with_nivo_common,
  general_default_props,
  get_formatter,
  TooltipFactory,
} from "src/charts/wrapped_nivo/wrapped_nivo_common";
import style_variables from "src/common_style_variables/common-variables.module.scss";

import text from "./WrappedNivoCircleProportion.yaml";
import "./WrappedNivoCircleProportion.scss";

const { textColor, minMediumDevice, maxMediumDevice } = style_variables;

const { text_maker, TM } = create_text_maker_component_with_nivo_common(text);

// VERY hacky abuse of ResponsiveCirclePacking... very fragile against nivo changes. Bonus comments left in this file to balance against that
// Would be trivial to make this graph ourselves, only reason for doing it like this is to get nivo native tooltips (and even
// then they're extra customized ones) and our common nivo graph utilities ...consider rethinking this though

const MIN_NODE_RADIUS = 2;
const ProportionalNode = ({ node, style, ...handlers }) => {
  const node_handlers = useNodeMouseHandlers(node, handlers);

  const {
    // these aren't values for the specific node, but for the whole graph, e.g. radius is always the outer circle radius,
    // and (x, y) is the center of the graph. Node specific values are calculated below
    radius: graph_radius,
    x: center_x,
    y: center_y,

    borderColor,
    borderWidth,
  } = _.mapValues(
    style,
    (value) =>
      // style prop values may be wrapped by react spring if they're animatable, need to unwrap the actual value
      // ... have to assume nothing's actually animating though, otherwise there's different logic to get the final value
      value?.get?.() || value
  );

  if (graph_radius <= 0) {
    return null;
  }

  const { node_radius, node_x, node_y } = (() => {
    if (!_.isEmpty(node.data.children)) {
      return {
        node_radius: graph_radius,
        node_x: center_x,
        node_y: center_y,
      };
    } else {
      const node_radius = _.max([
        graph_radius * Math.sqrt(node.percentage / 100), // do the math, make the actual area proportional
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
        fill={node.color}
        stroke={borderColor}
        strokeWidth={borderWidth}
        shapeRendering={"geometricPrecision"}
        {...node_handlers}
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
      labelsSkipRadius,
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
            <MediaQuery minDeviceWidth={minMediumDevice}>
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
            <MediaQuery maxDeviceWidth={maxMediumDevice}>
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
          <ResponsiveCirclePacking
            data={graph_data}
            id="name"
            value="value"
            colors={(d) => color_scale(d.data.name)}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            borderWidth={0}
            enableLabels={false}
            labelTextColor={textColor}
            labelsSkipRadius={labelsSkipRadius}
            leavesOnly={false}
            padding={0}
            circleComponent={ProportionalNode}
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
      <DisplayTable
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
