import { ResponsiveLine } from "@nivo/line";
import classNames from "classnames";
import _ from "lodash";
import React from "react";

import {
  textColor,
  secondaryColor,
  backgroundColor,
} from "src/core/color_defs.js";

import { SmartDisplayTable } from "../../components/index.js";
import { IconZoomIn, IconZoomOut } from "../../icons/icons.js";

import {
  create_text_maker_component_with_nivo_common,
  InteractiveGraph,
  general_default_props,
  DefaultTooltip,
  get_formatter,
  fix_legend_symbols,
} from "./wrapped_nivo_common.js";

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
      enableDotLabel,
      is_money,
      text_formatter,
      theme,
      colors,
      colorBy,
      tooltip,
      y_scale_max,
      y_scale_min,
      enableArea,
      enableGridX,
      enableGridY,
      stacked,
      markers,
      layers,
      disable_table_view,
      table_name,
      table_first_column_name,
      table_ordered_column_keys,
      isInteractive,
      motionDamping,
      motionStiffness,
      custom_table,
      enableDots,
      lineWidth,
    } = this.props;

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
        <SmartDisplayTable
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
            colorBy,
            colors,
            theme,
            enableDotLabel,
            markers,
            layers,
            isInteractive,
            motionDamping,
            motionStiffness,
            enableDots,
            lineWidth,
          }}
          legends={fix_legend_symbols(legends)}
          tooltip={(d) =>
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
          dotSize={stacked ? 0 : 10}
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
  tooltip: (slice, formatter) => {
    const tooltip_items = slice.data.map((d) => ({
      id: d.serie.id,
      color: d.serie.color,
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
  enableDotLabel: false,
  enableArea: false,
  stacked: false,
  disable_y_axis_zoom: false,
  yScale: {
    type: "linear",
    zoomed: false,
    toggle: false,
  },
};
