import { ResponsiveBar } from "@nivo/bar";

import _ from "lodash";
import React from "react";

import { SmartDisplayTable } from "src/components/index.js";

import { textColor } from "src/core/color_defs.js";

import {
  nivo_common_text_maker,
  InteractiveGraph,
  general_default_props,
  get_formatter,
  fix_legend_symbols,
} from "./wrapped_nivo_common.js";

const bar_table = (
  data,
  keys,
  indexBy,
  table_view_format,
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
          formatter: (value) =>
            _.isUndefined(value) ? "" : table_view_format(value),
        },
      ])
      .fromPairs()
      .value(),
  };

  return (
    <SmartDisplayTable
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
      label_format,
      is_money,
      text_formatter,
      theme,
      colors,
      colorBy,
      tooltip,
      enableGridX,
      enableGridY,
      onMouseEnter,
      onMouseLeave,
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
    } = this.props;

    const table =
      !disable_table_view &&
      (custom_table ||
        bar_table(
          data,
          keys,
          indexBy,
          get_formatter(is_money, text_formatter, true, false),
          table_name,
          table_first_column_name
        ));

    const graph = (
      <div style={{ height: graph_height }} aria-hidden="true">
        <ResponsiveBar
          {...{
            data,
            margin,
            colors,
            groupMode,
            enableGridX,
            enableGridY,
            colorBy,
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
          }}
          legends={fix_legend_symbols(legends)}
          keys={_.union(keys, [""])} //extra key allows negative bar to render (only needed when 1 type of key
          //and the key takes both negative or positive values)
          labelFormat={_.isUndefined(label_format) ? null : label_format}
          labelTextColor={textColor}
          tooltip={(d) =>
            tooltip([d], get_formatter(is_money, text_formatter, false))
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
      label_format,
      labelSkipWidth,
      is_money,
      text_formatter,
      theme,
      colors,
      colorBy,
      tooltip,
      enableGridX,
      enableGridY,
      padding,
      markers,
      disable_table_view,
      table_name,
      table_first_column_name,
      isInteractive,
      motionDamping,
      motionStiffness,
    } = this.props;

    const table =
      !disable_table_view &&
      bar_table(
        data,
        keys,
        indexBy,
        get_formatter(is_money, text_formatter, true, true),
        table_name,
        table_first_column_name
      );

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
            colorBy,
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
          labelFormat={_.isUndefined(label_format) ? null : label_format}
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
