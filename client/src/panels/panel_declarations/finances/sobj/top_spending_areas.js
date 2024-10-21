import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component } from "src/components/index";

import { formats } from "src/core/format";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { highlightColor, secondaryColor } from "src/style_constants/index";

import text from "./top_spending_areas.yaml";
import { StandardLegend } from "src/charts/legends";

const { text_maker, TM } = create_text_maker_component(text);

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
    .value();
};

const common_cal = (programs, programSobjs) => {
  const cut_off_index = 3;
  const rows_by_so = collapse_by_so(programs, programSobjs);

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

  return top_3_sos.concat(remainder);
};

const render_w_options =
  ({ text_key }) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { text_calculations, rows_by_so } = calculations;

    const graph_data = _.map(rows_by_so, (row) => _.omit(row, ["so_num"]));

    const nivoprops = {
      data: graph_data,
      keys: ["value"],
      indexBy: "label",
      enableLabel: true,
      isInteractive: false,
      remove_left_axis: true,
      bttm_axis: {
        renderTick: (tick) => {
          return (
            <g
              key={tick.tickIndex}
              transform={`translate(${tick.x},${tick.y + 16})`}
            >
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: "11px",
                }}
              >
                <TspanLineWrapper text={tick.value} width={20} />
              </text>
            </g>
          );
        },
      },
      margin: {
        top: 50,
        right: 40,
        bottom: 150,
        left: 40,
      },
      padding: 0.3,
      graph_height: "450px",
      label: (d) => (
        <tspan y={-10}>
          {formats.compact1(d.formattedValue, { raw: true })}
        </tspan>
      ),
      colors: (d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor),
      enableGridX: false,
    };

    const legend_items = [
      {
        active: true,
        color: secondaryColor,
        id: "exp",
        label: "Expenditure",
      },
      {
        active: true,
        color: highlightColor,
        id: "rev",
        label: "Revenue",
      },
    ];

    return (
      <InfographicPanel {...{ title, footnotes, sources, datasets }}>
        <TM k={text_key} args={text_calculations} />
        <StandardLegend
          legendListProps={{
            items: legend_items,
            isHorizontal: true,
            checkBoxProps: { isSolidBox: true },
          }}
        />
        <WrappedNivoBar {...nivoprops} />
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

        const top_3_sos_and_remainder = common_cal(
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

        const rows_by_so = collapse_by_so([subject], tables.programSobjs);

        const exp_sum = _.chain(rows_by_so)
          .map((row) => (row.value > 0 ? row.value : 0))
          .sum()
          .value();

        const rev_sum = _.chain(rows_by_so)
          .map((row) => (row.value < 0 ? row.value : 0))
          .sum()
          .value();

        const net_sum = exp_sum + rev_sum;

        const text_calculations = {
          subject,
          top_3_sos_and_remainder,
          top_so_name: top_3_sos_and_remainder[0].label,
          top_so_spent: top_3_sos_and_remainder[0].value,
          total_spent,
          top_so_pct,
          exp_sum,
          rev_sum,
          net_sum,
        };

        return {
          text_calculations,
          rows_by_so,
        };
      },
      render: render_w_options({ text_key: "program_top_spending_areas_text" }),
    }),
  });
