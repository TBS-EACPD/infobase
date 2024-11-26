import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
} from "src/components/index";

import { formats } from "src/core/format";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import { highlightColor, secondaryColor, textColor } from "src/style_constants";

import text from "./top_spending_areas.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const is_non_revenue = (d) => +d.so_num < 19;

const collapse_by_so = function (programs, table, filter) {
  // common calculation for organizing program/so row data by so
  // and summing up all the programs for the last year of spending
  // then sorting by largest to smallest

  return _.chain(programs)
    .map((prog) => table.programs.get(prog))
    .compact()
    .flatten()
    .compact()
    .groupBy("so")
    .toPairs()
    .map((key_value) => ({
      label: key_value[0],
      so_num: key_value[1][0].so_num,
      value: sum(key_value[1], (d) => d["{{pa_last_year}}"]),
    }))
    .filter(filter || (() => true))
    .sortBy((d) => -d.value)
    .value();
};

const render_w_options =
  ({ text_key }) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { text_calculations, rows_by_so } = calculations;

    const graph_data = _.chain(rows_by_so)
      .map((d) => ({
        label: d["label"],
        id: d["so_num"],
        value: d["value"],
      }))
      .orderBy("id", "desc")
      .value();

    // Increase height of the graph region for y-axis labels to have sufficient room
    // This is required to corretly display the labels when too many programs are present
    const divHeight = _.chain([1000 * (graph_data.length / 30) * 2, 100]) // 100 is the minimum graph height
      .max()
      .thru((maxVal) => [maxVal, 500]) // 500 is the max graph height
      .min()
      .value();

    const markers = _.map(graph_data, ({ label, value }) => ({
      axis: "y",
      value: label,
      lineStyle: { strokeWidth: 0 },
      textStyle: {
        fill: value < 0 ? highlightColor : textColor,
        fontSize: "11px",
      },
      legend: formats.compact1_raw(value),
      legendOffsetX: -60,
      legendOffsetY: Math.max(-(divHeight / (3.3 * graph_data.length)), -18), // Math.max so that there would be a set value for when the graph has one bar/data point
    }));

    const column_configs = {
      so_num: {
        index: 0,
        header: "ID",
      },
      label: {
        index: 1,
        header: "Standard Objects",
      },
      value: {
        index: 2,
        header: "Expenditure",
        is_summable: true,
        formatter: "dollar",
      },
    };

    const custom_table_data = _.sortBy(rows_by_so, "so_num");

    return (
      <InfographicPanel {...{ title, footnotes, sources, datasets }}>
        <TM k={text_key} args={text_calculations} />
        <WrappedNivoHBar
          data={graph_data}
          keys={["value"]}
          indexBy="label"
          colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
          margin={{
            top: 0,
            right: 100,
            bottom: 50,
            left: 250,
          }}
          bttm_axis={{
            tickSize: 5,
            tickPadding: 5,
            tickValues: 6,
            tickRotation: -20,
            format: (d) => formats.compact1_raw(d),
          }}
          markers={markers}
          custom_table={
            <DisplayTable
              column_configs={column_configs}
              data={custom_table_data}
            />
          }
        />
      </InfographicPanel>
    );
  };

export const declare_top_spending_areas_panel = () =>
  declare_panel({
    panel_key: "top_spending_areas",
    subject_types: ["program"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["programSobjs"],
      get_dataset_keys: () => ["program_standard_objects"],
      get_title: () => text_maker("top_spending_areas_title"),
      calculate: ({ subject, tables }) => {
        if (_.isEmpty(tables.programSobjs.programs.get(subject))) {
          return false;
        }

        const rows_by_so = _.filter(
          collapse_by_so([subject], tables.programSobjs, is_non_revenue),
          (row) => row.value
        );

        if (_.isEmpty(rows_by_so)) {
          return false;
        }

        const total_spent = _.sum(_.map(rows_by_so, (so) => so.value));

        const top_so = _.maxBy(rows_by_so, "value");

        const low_so = _.minBy(rows_by_so, "value");

        const text_calculations = {
          subject,
          top_so_name: top_so.label,
          top_so_value: top_so.value,
          low_so_name: low_so.label,
          low_so_value: low_so.value,
          total_spent,
        };

        return {
          text_calculations,
          rows_by_so,
        };
      },
      render: render_w_options({ text_key: "program_top_spending_areas_text" }),
    }),
  });
