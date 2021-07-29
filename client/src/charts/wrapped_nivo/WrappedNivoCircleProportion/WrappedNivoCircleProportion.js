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
import {
  textColor,
  minMediumDevice,
  maxMediumDevice,
} from "src/style_constants/index";

import text from "./WrappedNivoCircleProportion.yaml";
import "./WrappedNivoCircleProportion.scss";

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

    const Circles = () => {
      // arbitrary parent values
      const parent_radius = 35;
      const parent_cx = 175;
      const parent_cy = 40;

      // child circle calculations
      const child_percent = child_value / parent_value;
      const child_radius = parent_radius * child_percent;

      return (
        <svg viewBox="0 0 350 350">
          <circle
            cx={parent_cx.toString()}
            cy={parent_cy.toString()}
            r={parent_radius.toString()}
            fill={color_scale(parent_name)}
          />
          <circle
            cx={parent_cx.toString()}
            cy={(parent_cy + parent_radius - child_radius).toString()}
            r={child_radius.toString()}
            fill={color_scale(child_name)}
          />
        </svg>
      );
    };

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
        <div>
          <tr>
            <td className="nivo-tooltip__label">{parent_name}</td>
            <td className="nivo-tooltip__value">
              {value_formatter(parent.value)}
            </td>
            <td className="nivo-tooltip__value">
              {`(${formats.smart_percentage1_raw(
                parent_value / parent_value
              )})`}
            </td>
            <td>
              <svg>
                <circle
                  cx="20"
                  cy="75"
                  r="10"
                  fill={color_scale(parent_name)}
                />
              </svg>
            </td>
          </tr>
          <tr>
            <td className="nivo-tooltip__label">{child_name}</td>
            <td className="nivo-tooltip__value">
              {value_formatter(parent.value)}
            </td>
            <td className="nivo-tooltip__value">
              {`(${formats.smart_percentage1_raw(child_value / parent_value)})`}
            </td>
            <td>
              <svg>
                <circle cx="20" cy="75" r="10" fill={color_scale(child_name)} />
              </svg>
            </td>
          </tr>
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
