import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component } from "src/components/index";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

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

  return top_3_sos.concat(remainder);
};

const render_w_options =
  ({ text_key }) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { top_3_sos_and_remainder, text_calculations } = calculations;

    const graph_data = top_3_sos_and_remainder.map((d) => ({
      label: d["label"],
      id: d["label"],
      value: d["value"],
    }));

    return (
      <StdPanel {...{ title, footnotes, sources, datasets }}>
        <Col isText size={5}>
          <TM k={text_key} args={text_calculations} />
        </Col>
        <Col isGraph={!is_a11y_mode} size={7}>
          <WrappedNivoPie data={graph_data} graph_height="450px" />
        </Col>
      </StdPanel>
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

        const text_calculations = {
          subject,
          top_3_sos_and_remainder,
          top_so_name: top_3_sos_and_remainder[0].label,
          top_so_spent: top_3_sos_and_remainder[0].value,
          total_spent,
          top_so_pct,
        };

        return {
          text_calculations,
          top_3_sos_and_remainder,
        };
      },
      render: render_w_options({ text_key: "program_top_spending_areas_text" }),
    }),
  });
