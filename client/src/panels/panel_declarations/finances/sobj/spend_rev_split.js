import _ from "lodash";
import React from "react";

import {StdPanel, Col} from "src/panels/panel_declarations/InfographicPanel.js";
import {
  create_text_maker_component,
  declare_panel,
} from "src/panels/panel_declarations/shared.js";

import { highlightColor, secondaryColor } from "src/core/color_defs.js";
import { formats} from "src/core/format.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import {WrappedNivoBar} from "src/charts/wrapped_nivo/index.js";
import * as table_common from "src/tables/table_common.js";



import text from "./spend_rev_split.yaml";

const { rows_to_rev_split } = table_common;

const { text_maker, TM } = create_text_maker_component(text);

const text_keys_by_level = {
  dept: "dept_spend_rev_split_text",
  program: "program_spend_rev_split_text",
};

function render({ calculations, footnotes, sources }) {
  const { panel_args, subject } = calculations;
  const { text_calculations } = panel_args;
  const {
    last_year_gross_exp,
    last_year_net_exp,
    last_year_rev,
  } = text_calculations;

  const series = [last_year_gross_exp, last_year_rev];
  const _ticks = ["gross", "revenues"];

  // if last_year_rev is 0, then no point in showing the net bar
  if (last_year_rev !== 0) {
    series.push(last_year_net_exp);
    _ticks.push("net");
  }

  const ticks = _ticks.map(text_maker);
  const spend_rev_data = _.map(series, (spend_rev_value, tick_index) => ({
    title: ticks[tick_index],
    [text_maker("value")]: spend_rev_value,
  }));

  const graph_content = (() => {
    if (is_a11y_mode) {
      return null;
    } else {
      return (
        <div>
          <WrappedNivoBar
            data={spend_rev_data}
            keys={[text_maker("value")]}
            indexBy="title"
            enableLabel={true}
            isInteractive={false}
            label_format={(d) => (
              <tspan y={-10}>{formats.compact1(d, { raw: true })}</tspan>
            )}
            colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
            enableGridX={false}
          />
        </div>
      );
    }
  })();

  return (
    <StdPanel
      title={text_maker("spend_rev_split_title")}
      {...{ footnotes, sources }}
    >
      <Col size={5} isText>
        <TM k={text_keys_by_level[subject.level]} args={text_calculations} />
      </Col>
      <Col size={7} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
}

export const declare_spend_rev_split_panel = () =>
  declare_panel({
    panel_key: "spend_rev_split",
    levels: ["dept", "program"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "dept":
          return {
            depends_on: ["orgSobjs"],
            footnotes: ["SOBJ_REV"],
            calculate(subject, options) {
              const { orgSobjs } = this.tables;
              const last_year_spend = orgSobjs.so_num(
                "{{pa_last_year}}",
                subject.id,
                true
              );
              const last_year_rev =
                (last_year_spend[22] || 0) + (last_year_spend[21] || 0);
              const minus_last_year_rev = -last_year_rev;
              const last_year_gross_exp = _.sum(
                _.map(_.range(1, 13), (i) => last_year_spend[i] || 0)
              );
              if (last_year_rev === 0) {
                return false;
              }
              const last_year_net_exp =
                last_year_gross_exp - minus_last_year_rev;

              const text_calculations = {
                subject,
                last_year_rev,
                minus_last_year_rev,
                last_year_gross_exp,
                last_year_net_exp,
              };

              return {
                text_calculations,
              };
            },
            render,
          };
        case "program":
          return {
            depends_on: ["programSobjs"],
            calculate(subject, options) {
              const { programSobjs } = this.tables;
              const prog_rows = programSobjs.programs.get(subject);
              const rev_split = rows_to_rev_split(prog_rows);
              if (!rev_split || rev_split.neg_exp === 0) {
                return false;
              }
              const text_calculations = {
                subject,
                last_year_rev: rev_split.neg_exp,
                minus_last_year_rev: -rev_split.neg_exp,
                last_year_gross_exp: rev_split.gross_exp,
                last_year_net_exp: rev_split.net_exp,
              };
              return { text_calculations };
            },
            render,
          };
      }
    },
  });
