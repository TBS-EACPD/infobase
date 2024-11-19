import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
  GraphOverlay,
} from "src/components/index";

import { formats } from "src/core/format";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import {
  highlightColor,
  secondaryColor,
  textColor,
} from "src/style_constants/index";

import text from "./expenditure_bar.yaml";

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

const common_cal = (programs, programSobjs) => {
  const cut_off_index = 3;
  const rows_by_so = collapse_by_so(programs, programSobjs, is_non_revenue);

  if (
    rows_by_so.length <= 1 ||
    _.every(rows_by_so, ({ value }) => value === 0)
  ) {
    return false;
  }

  const top_3_sos = _.take(rows_by_so, cut_off_index);
  const remainder =
    top_3_sos.length > cut_off_index - 1
      ? {
          label: text_maker("other_s"),
          value: sum(
            _.takeRight(rows_by_so, rows_by_so.length - cut_off_index),
            _.property("value")
          ),
        }
      : [];

  const top_3_sos_and_remainder = top_3_sos.concat(remainder);

  const so_min = _.minBy(rows_by_so, "value");

  return { top_3_sos_and_remainder, so_min, rows_by_so };
};

const render_w_options =
  ({ text_key }) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { text_calculations, rows_by_so } = calculations;

    const formatter_compact1 = formats.compact1_raw;

    const formatter_compact2 = formats.compact2_raw;

    const graph_data = _.chain(rows_by_so)
      .map((d) => ({
        label: d["label"],
        id: d["so_num"],
        expenditure: d["value"],
      }))
      .orderBy("id", "desc")
      .value();

    const custom_table_data = _.chain(rows_by_so)
      .map(({ label, so_num, value }) => ({ label, so_num, value }))
      .sortBy("so_num")
      .value();

    // Increase height of the graph region for y-axis labels to have sufficient room
    // This is required to corretly display the labels when too many programs are present
    const divHeight = _.chain([1000 * (graph_data.length / 30) * 2, 100]) // 100 is the minimum graph height
      .max()
      .thru((maxVal) => [maxVal, 500]) // 1200 is the max graph height
      .min()
      .value();

    const markers = _.map(graph_data, ({ label, expenditure }) => ({
      axis: "y",
      value: label,
      lineStyle: { strokeWidth: 0 },
      textStyle: {
        fill: expenditure < 0 ? highlightColor : textColor,
        fontSize: "11px",
      },
      legend: formatter_compact2(expenditure),
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
        is_searchable: true,
      },
      value: {
        index: 2,
        header: "Expenditure",
        is_summable: true,
        formatter: "dollar",
      },
    };

    return (
      <InfographicPanel {...{ title, footnotes, sources, datasets }}>
        <TM k={text_key} args={text_calculations} />
        <div>
          <GraphOverlay>
            <WrappedNivoHBar
              data={graph_data}
              keys={["expenditure"]}
              indexBy="label"
              colors={(d) =>
                d.data[d.id] < 0 ? highlightColor : secondaryColor
              }
              graph_height={divHeight}
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
                format: (d) => formatter_compact1(d),
              }}
              markers={markers}
              custom_table={
                <DisplayTable
                  column_configs={column_configs}
                  data={custom_table_data}
                />
              }
            />
          </GraphOverlay>
        </div>
      </InfographicPanel>
    );
  };

export const declare_expenditure_bar_panel = () =>
  declare_panel({
    panel_key: "expenditure_bar",
    subject_types: ["program"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["programSobjs"],
      get_dataset_keys: () => ["program_standard_objects"],
      get_title: () => text_maker("top_spending_areas_title"),
      calculate: ({ subject, tables }) => {
        if (_.isEmpty(tables.programSobjs.programs.get(subject))) {
          return false;
        }

        const { top_3_sos_and_remainder, so_min, rows_by_so } = common_cal(
          [subject],
          tables.programSobjs
        );
        if (!top_3_sos_and_remainder) {
          return false;
        }

        const total_spent = _.sum(
          _.map(top_3_sos_and_remainder, (so) => so.value)
        );
        const top_so_pct = top_3_sos_and_remainder[0].value / total_spent;

        const text_calculations = {
          subject,
          top_3_sos_and_remainder,
          top_so_name: top_3_sos_and_remainder[0].label,
          top_so_spent: top_3_sos_and_remainder[0].value,
          so_min_name: so_min.label,
          so_min_spent: so_min.value,
          total_spent,
          top_so_pct,
        };

        return {
          text_calculations,
          top_3_sos_and_remainder,
          rows_by_so,
        };
      },
      render: render_w_options({ text_key: "program_top_spending_areas_text" }),
    }),
  });
