import { ResponsiveLine } from "@nivo/line";
import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { DisplayTable } from "src/components/index";

import {
  textColor,
  secondaryColor,
  backgroundColor,
} from "src/core/color_defs";

import { IconZoomIn, IconZoomOut } from "src/icons/icons";

import {
  create_text_maker_component_with_nivo_common,
  InteractiveGraph,
  general_default_props,
  DefaultTooltip,
  get_formatter,
  fix_legend_symbols,
} from "./wrapped_nivo_common";

import text from "./WrappedNivoLine.yaml";

const { text_maker } = create_text_maker_component_with_nivo_common(text);

const get_scale_bounds = (stacked, raw_data, zoomed) => {
  const min = _.min(raw_data);
  const max = _.max(raw_data);
  const scaled_min = min < 0 ? min * 1.05 : min * 0.95;
  const scaled_max = max < 0 ? max * 0.95 : max * 1.05;
  if (stacked) {
    return {
      min: min < 0 ? scaled_min : 0,
      max: "auto",
    };
  }
  return {
    min: zoomed || min < 0 ? scaled_min : 0,
    max: !zoomed && max < 0 ? 0 : scaled_max,
  };
};

export class WrappedNivoLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      y_scale_zoomed: false,
    };
  }
  render() {
    const {
      data,
      raw_data,
      margin,
      legends,
      graph_height,
      bttm_axis,
      left_axis,
      remove_bottom_axis,
      remove_left_axis,
      disable_y_axis_zoom,
      yScale,
      is_money,
      text_formatter,
      theme,
      colors,
      tooltip,
      y_scale_max,
      y_scale_min,
      enableArea,
      enableGridX,
      enableGridY,
      stacked,
      markers,
      disable_table_view,
      table_name,
      table_first_column_name,
      table_ordered_column_keys,
      isInteractive,
      motionDamping,
      motionStiffness,
      custom_table,
      enablePoints,
      lineWidth,
    } = this.props;

    const line_segments = _.chain(data)
      .flatMap(({ id, data }, z_index) =>
        _.chain(data)
          .dropRight()
          .map((point, index) => ({
            id,
            z_index,
            range: `${point.x}/${data[index + 1].x}`,
            data: [point, data[index + 1]],
          }))
          .value()
      )
      .thru((line_segments) =>
        _.map(line_segments, (line_segment) => ({
          ...line_segment,
          total_overlaps: _.filter(
            line_segments,
            ({ z_index, range, data }) =>
              z_index !== line_segment.z_index &&
              range === line_segment.range &&
              _.isEqual(data, line_segment.data)
          ).length,
          overlaps_below: _.filter(
            line_segments,
            ({ z_index, range, data }) =>
              z_index < line_segment.z_index &&
              range === line_segment.range &&
              _.isEqual(data, line_segment.data)
          ).length,
        }))
      )
      .value();
    const lines_with_dashed_overlaps = ({ lineGenerator, xScale, yScale }) =>
      _.map(
        line_segments,
        ({ id, data, total_overlaps, z_index, overlaps_below }, index) => {
          const gap_between_points = xScale(data[1].x) - xScale(data[0].x);
          const dash_size = gap_between_points / (total_overlaps + 1) / 2;
          return (
            <path
              key={index}
              d={lineGenerator(
                _.map(data, ({ x, y }) => ({
                  x: xScale(x),
                  y: !_.isNull(y) ? yScale(y) : null,
                }))
              )}
              fill="none"
              style={{
                stroke: _.isFunction(colors) ? colors({ id }) : colors,
                strokeWidth: 2.5,
                strokeDasharray: total_overlaps
                  ? `${dash_size} ${total_overlaps * dash_size}`
                  : null,
                strokeDashoffset: total_overlaps
                  ? overlaps_below * dash_size
                  : null,
              }}
            />
          );
        }
      );

    const layers = [
      "grid",
      "markers",
      lines_with_dashed_overlaps,
      "areas",
      "slices",
      "points",
      "axes",
      "legends",
    ];

    const { y_scale_zoomed } = this.state;

    const get_table = () => {
      const table_data = _.chain(data)
        .map((row) => {
          const series_name = row.id;
          return _.chain(row.data)
            .map((series) =>
              _.isNil(series.y)
                ? undefined
                : { label: series.x, [series_name]: series.y }
            )
            .value();
        })
        .flatten()
        .compact()
        .groupBy("label")
        .map(_.spread(_.merge))
        .value();
      const line_table_value_formatter = (value) =>
        _.isUndefined(value)
          ? ""
          : get_formatter(is_money, text_formatter, true, false)(value);
      const column_configs = {
        label: {
          index: 0,
          header: table_first_column_name || text_maker("label"),
          is_searchable: true,
        },
        ..._.chain(table_ordered_column_keys || _.map(data, "id"))
          .map((col, idx) => [
            col,
            {
              index: idx + 1,
              header: col,
              formatter: line_table_value_formatter,
            },
          ])
          .fromPairs()
          .value(),
      };
      return (
        <DisplayTable
          data={table_data}
          column_configs={column_configs}
          table_name={table_name || text_maker("default_table_name")}
        />
      );
    };

    const table = !disable_table_view && (custom_table || get_table());

    const zoom_button =
      !disable_y_axis_zoom && !enableArea ? (
        <button
          className={classNames("btn-ib-primary", "btn-ib-array")}
          onClick={() => {
            this.setState({
              y_scale_zoomed: !y_scale_zoomed,
            });
          }}
        >
          {this.state.y_scale_zoomed ? (
            <IconZoomOut
              title={text_maker("zoom_out")}
              color={secondaryColor}
              alternate_color={backgroundColor}
            />
          ) : (
            <IconZoomIn
              title={text_maker("zoom_in")}
              color={secondaryColor}
              alternate_color={backgroundColor}
            />
          )}
        </button>
      ) : undefined;

    const graph = (
      <div style={{ height: graph_height }} aria-hidden="true">
        <ResponsiveLine
          {...{
            data,
            margin,
            enableGridX,
            enableGridY,
            enableArea,
            colors,
            theme,
            markers,
            layers,
            isInteractive,
            motionDamping,
            motionStiffness,
            enablePoints,
            lineWidth,
          }}
          legends={fix_legend_symbols(legends)}
          enableSlices={"x"}
          sliceTooltip={(d) =>
            tooltip(d, get_formatter(is_money, text_formatter, false))
          }
          yScale={{
            stacked: !!stacked,
            type: "linear",
            min:
              y_scale_min ||
              get_scale_bounds(stacked, raw_data, y_scale_zoomed).min,
            max:
              y_scale_max ||
              get_scale_bounds(stacked, raw_data, y_scale_zoomed).max,
            ...(yScale || {}),
          }}
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={
            remove_left_axis
              ? null
              : {
                  orient: "left",
                  tickSize: 5,
                  tickPadding: 5,
                  tickValues: 6,
                  format: (d) => get_formatter(is_money, text_formatter)(d),
                  ...(left_axis || {}),
                }
          }
          axisTop={null}
          axisRight={null}
          xScale={{ type: "point" }}
          animate={true}
          pointSize={stacked ? 0 : 10}
          pointColor={colors}
          areaOpacity={stacked ? 1 : 0}
        />
      </div>
    );

    return (
      <InteractiveGraph
        graph={graph}
        table={table}
        other_buttons={[zoom_button]}
        table_name={table_name}
      />
    );
  }
}
WrappedNivoLine.defaultProps = {
  ...general_default_props,
  theme: {
    tooltip: {
      boxShadow: "rgb(0 0 0 / 25%) 0px 1px 2px",
    },
  },
  tooltip: ({ slice }, formatter) => {
    const tooltip_items = slice.points.map((d) => ({
      id: d.serieId,
      color: d.serieColor,
      value: d.data.y,
    }));

    return (
      <DefaultTooltip tooltip_items={tooltip_items} formatter={formatter} />
    );
  },
  colors: textColor,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 12,
  },
  enableArea: false,
  stacked: false,
  disable_y_axis_zoom: false,
  yScale: {
    type: "linear",
    zoomed: false,
    toggle: false,
  },
};
