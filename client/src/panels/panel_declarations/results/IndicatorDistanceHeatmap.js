import { ResponsiveHeatMap } from "@nivo/heatmap";
import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index";

import {
  fontFamily,
  textColor,
  textLightColor,
} from "src/style_constants/index";

import text from "./IndicatorDistanceChart.yaml";

import "./IndicatorDistanceHeatmap.scss";

const { text_maker } = create_text_maker_component(text);

const tone_color = {
  short: "#4abbc4",
  met: "#206bbd",
  exceeded: "#e89a40",
};

const colour_layout = {
  row_height: 52,
  margin: { top: 8, right: 28, bottom: 40, left: 250 },
};

const scale_layout = {
  row_height: 44,
  margin: { top: 72, right: 12, bottom: 72, left: 250 },
};

const wrap_label = (label, max_length) => {
  const words = _.split(label, " ");
  const lines = [];
  let line = "";

  _.forEach(words, (word) => {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > max_length) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) {
    lines.push(line);
  }
  return lines;
};

const RowTick = ({ x, y, value }) => {
  const lines = wrap_label(value, 32);
  const line_height = 13;
  const first_offset = -((lines.length - 1) * line_height) / 2;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="end"
        style={{ fontFamily, fontSize: 12, fill: textColor }}
      >
        {_.map(lines, (line, index) => (
          <tspan
            key={index}
            x={-10}
            dy={index === 0 ? first_offset : line_height}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const color_channels = (color) => {
  if (_.startsWith(color, "#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? _.map(hex, (character) => character + character).join("")
        : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const match = /rgb\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3])]
    : null;
};

const scale_label_color = (cell) => {
  const channels = color_channels(cell.color);
  if (!channels) {
    return textColor;
  }
  const luminance =
    (0.299 * channels[0] + 0.587 * channels[1] + 0.114 * channels[2]) / 255;
  return luminance < 0.6 ? textLightColor : textColor;
};

const heatmap_data = (rows, bins, include_zeros) =>
  _.map(rows, (row) => ({
    id: row.name,
    data: _.map(bins, (bin) => {
      const count = row.counts[bin.id];
      return {
        x: text_maker(bin.label_key),
        y: include_zeros || count > 0 ? count : null,
        tone: bin.tone,
      };
    }),
  }));

export const IndicatorDistanceHeatmap = ({ rows, bins, variant }) => {
  const is_scale = variant === "scale";
  const layout = is_scale ? scale_layout : colour_layout;
  const labeled_ticks = new Set(
    _.map(_.filter(bins, "show_axis_label"), (bin) => text_maker(bin.label_key))
  );
  const BottomTick = ({ x, y, value }) => {
    if (!labeled_ticks.has(value)) {
      return null;
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          textAnchor="middle"
          dominantBaseline="hanging"
          dy={8}
          style={{ fontFamily, fontSize: 11, fill: textColor }}
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div
      className="indicator-distance-heatmap__plot"
      style={{
        height:
          rows.length * layout.row_height +
          layout.margin.top +
          layout.margin.bottom,
      }}
      aria-hidden="true"
    >
      <ResponsiveHeatMap
        data={heatmap_data(rows, bins, is_scale)}
        margin={layout.margin}
        axisTop={
          is_scale
            ? { tickSize: 5, tickPadding: 5, tickRotation: -90 }
            : null
        }
        axisRight={null}
        axisBottom={
          is_scale
            ? null
            : { tickSize: 0, tickPadding: 0, renderTick: BottomTick }
        }
        axisLeft={{
          tickSize: 0,
          tickPadding: 0,
          renderTick: RowTick,
        }}
        xInnerPadding={is_scale ? 0 : 0.08}
        yInnerPadding={is_scale ? 0 : 0.22}
        colors={
          is_scale
            ? { type: "sequential", scheme: "blues", minValue: 0 }
            : (cell) => tone_color[cell.data.tone]
        }
        emptyColor={is_scale ? "#f7fbff" : "#f3f3f3"}
        borderWidth={1}
        borderColor={
          is_scale
            ? { from: "color", modifiers: [["darker", 0.3]] }
            : "#ffffff"
        }
        enableLabels
        labelTextColor={
          is_scale
            ? scale_label_color
            : (cell) =>
                cell.data.tone === "met" ? textLightColor : textColor
        }
        inactiveOpacity={is_scale ? 0.15 : 1}
        hoverTarget={is_scale ? "rowColumn" : "cell"}
        legends={
          is_scale
            ? [
                {
                  anchor: "bottom",
                  translateX: 0,
                  translateY: 48,
                  length: 280,
                  thickness: 10,
                  direction: "row",
                  tickPosition: "after",
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  title: text_maker("distance_histogram_y_axis"),
                  titleAlign: "start",
                  titleOffset: 4,
                },
              ]
            : []
        }
        theme={{
          text: { fontFamily },
          axis: {
            domain: {
              line: { stroke: "#bbb", strokeWidth: 1 },
            },
            ticks: {
              text: { fontFamily, fontSize: 11, fill: textColor },
            },
          },
          labels: {
            text: {
              fontFamily,
              fontSize: is_scale ? 11 : 12,
              fontWeight: is_scale ? 600 : 700,
            },
          },
          legends: {
            text: { fontFamily, fontSize: 11, fill: textColor },
            title: {
              text: { fontFamily, fontSize: 11, fill: textColor },
            },
          },
        }}
        tooltip={({ cell }) =>
          cell.value === null ? null : (
            <div className="indicator-distance-heatmap__tooltip">
              {text_maker("distance_cell_title", {
                label: cell.data.x,
                count: cell.value,
              })}
            </div>
          )
        }
      />
    </div>
  );
};
