import { ResponsiveBar } from "@nivo/bar";

import _ from "lodash";
import React from "react";

import { DisplayTable } from "src/components/index";

import { get_formatter } from "src/core/format";

import {
  nivo_common_text_maker,
  InteractiveGraph,
  general_default_props,
  fix_legend_symbols,
} from "src/charts/wrapped_nivo/wrapped_nivo_common";
import { textColor } from "src/style_constants/index";

const bar_table = (
  data,
  keys,
  indexBy,
  table_view_format,
  tooltip_format,
  table_name,
  table_first_column_name
) => {
  const column_configs = {
    [indexBy]: {
      index: 0,
      header: table_first_column_name || nivo_common_text_maker("label"),
      is_searchable: true,
    },
    ..._.chain(keys)
      .map((key, idx) => [
        key,
        {
          index: idx + 1,
          header: key,
          formatter: (value) => {
            if (_.isUndefined(value)) return "";

            if (tooltip_format) {
              return tooltip_format(value);
            } else {
              return table_view_format(value);
            }
          },
        },
      ])
      .fromPairs()
      .value(),
  };

  return (
    <DisplayTable
      data={_.map(data, (row) => _.pick(row, [indexBy, ...keys]))}
      column_configs={column_configs}
      table_name={table_name || nivo_common_text_maker("default_table_name")}
    />
  );
};

export class WrappedNivoBar extends React.Component {
  render() {
    const {
      data,
      keys,
      groupMode,
      indexBy,
      margin,
      legends,
      graph_height,
      bttm_axis,
      left_axis,
      remove_bottom_axis,
      remove_left_axis,
      enableLabel,
      label,
      is_money,
      text_formatter,
      tooltip_formatter,
      theme,
      colors,
      tooltip,
      enableGridX,
      enableGridY,
      onMouseEnter,
      onMouseLeave,
      markers,
      onClick,
      padding,
      borderWidth,
      disable_table_view,
      custom_table,
      table_name,
      table_first_column_name,
      isInteractive,
      animate,
      motionDamping,
      motionStiffness,
      defs,
      fill,
      colorBy,
    } = this.props;

    const table =
      !disable_table_view &&
      (custom_table ||
        bar_table(
          data,
          keys,
          indexBy,
          get_formatter(is_money, text_formatter, true, false),
          tooltip_formatter
            ? get_formatter(is_money, tooltip_formatter, true, false)
            : null,
          table_name,
          table_first_column_name
        ));

    const graph = (
      <div style={{ height: graph_height }} aria-hidden="true">
        <ResponsiveBar
          {...{
            data,
            markers,
            margin,
            colors,
            groupMode,
            enableGridX,
            enableGridY,
            theme,
            indexBy,
            onMouseEnter,
            onMouseLeave,
            onClick,
            padding,
            tooltip,
            enableLabel,
            label,
            borderWidth,
            isInteractive,
            animate,
            motionDamping,
            motionStiffness,
            defs,
            fill,
            colorBy,
          }}
          legends={fix_legend_symbols(legends)}
          keys={_.union(keys, [""])} //extra key allows negative bar to render (only needed when 1 type of key
          //and the key takes both negative or positive values)
          labelTextColor={textColor}
          tooltip={(d) =>
            tooltip(
              [d],
              get_formatter(
                is_money,
                tooltip_formatter || text_formatter,
                false
              )
            )
          }
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={
            remove_left_axis
              ? null
              : {
                  tickValues: 6,
                  format: (d) => get_formatter(is_money, text_formatter)(d),
                  min: "auto",
                  max: "auto",
                  ...(left_axis || {}),
                }
          }
        />
      </div>
    );

    return (
      <InteractiveGraph graph={graph} table={table} table_name={table_name} />
    );
  }
}
WrappedNivoBar.defaultProps = {
  ...general_default_props,
  padding: 0.3,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
    tickRotation: 0,
  },
};

export class WrappedNivoHBar extends React.Component {
  render() {
    const {
      data,
      keys,
      groupMode,
      indexBy,
      margin,
      legends,
      graph_height,
      bttm_axis,
      left_axis,
      top_axis,
      remove_bottom_axis,
      remove_left_axis,
      add_top_axis,
      enableLabel,
      label,
      labelSkipWidth,
      is_money,
      text_formatter,
      theme,
      colors,
      tooltip,
      enableGridX,
      enableGridY,
      padding,
      markers,
      disable_table_view,
      table_name,
      custom_table,
      table_first_column_name,
      isInteractive,
      motionDamping,
      motionStiffness,
    } = this.props;

    const table =
      !disable_table_view &&
      (custom_table ||
        bar_table(
          data,
          keys,
          indexBy,
          get_formatter(is_money, text_formatter, true, true),
          table_name,
          table_first_column_name
        ));

    const graph = (
      <div
        className="centerer"
        style={{ height: graph_height }}
        aria-hidden="true"
      >
        <ResponsiveBar
          {...{
            data,
            margin,
            colors,
            groupMode,
            enableGridX,
            enableGridY,
            theme,
            indexBy,
            enableLabel,
            label,
            labelSkipWidth,
            padding,
            markers,
            isInteractive,
            motionDamping,
            motionStiffness,
          }}
          legends={fix_legend_symbols(legends)}
          layout="horizontal"
          keys={keys}
          labelTextColor={textColor}
          tooltip={(d) =>
            tooltip([d], get_formatter(is_money, text_formatter, false))
          }
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisTop={add_top_axis ? top_axis : null}
          axisLeft={
            remove_left_axis
              ? null
              : {
                  tickValues: 6,
                  format: (d) => get_formatter(is_money, text_formatter)(d),
                  min: "auto",
                  max: "auto",
                  ...(left_axis || {}),
                }
          }
        />
      </div>
    );

    return (
      <InteractiveGraph graph={graph} table={table} table_name={table_name} />
    );
  }
}
WrappedNivoHBar.defaultProps = {
  ...general_default_props,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
    tickRotation: -20,
  },
  theme: {
    legends: {
      text: {
        fontSize: 14,
      },
    },
    labels: {
      text: {
        fontSize: 14,
      },
    },
  },
  padding: 0.3,
  labelSkipWidth: 10,
};
