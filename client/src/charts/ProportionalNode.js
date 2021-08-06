import { useNodeMouseHandlers } from "@nivo/circle-packing";
import _ from "lodash";
import React from "react";

const MIN_NODE_RADIUS = 2;
export const ProportionalNode = ({ node, style, ...handlers }) => {
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
