import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component } from "src/components/index";

import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { highlightColor, secondaryColor } from "src/style_constants/index";

import text from "./spend_rev_split.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const text_keys_by_subject_type = {
  dept: "dept_spend_rev_split_text",
  program: "program_spend_rev_split_text",
};

const is_revenue = (so_num) => +so_num > 19;
const last_year_col = "{{pa_last_year}}";

const sum_last_year_exp = (rows) =>
  _.chain(rows)
    .map((row) => row[last_year_col])
    .filter(_.isNumber)
    .reduce((acc, item) => acc + item, 0)
    .value();

const rows_to_rev_split = (rows) => {
  const [neg_exp, gross_exp] = _.chain(rows)
    .filter((x) => x) //TODO remove this
    .partition((row) => is_revenue(row.so_num))
    .map(sum_last_year_exp)
    .value();
  const net_exp = gross_exp + neg_exp;
  if (neg_exp === 0) {
    return false;
  }
  return { neg_exp, gross_exp, net_exp };
};

function render({ title, subject, calculations, footnotes, sources }) {
  const { text_calculations } = calculations;
  const { last_year_gross_exp, last_year_net_exp, last_year_rev } =
    text_calculations;

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
            label={(d) => (
              <tspan y={-10}>
                {formats.compact1(d.formattedValue, { raw: true })}
              </tspan>
            )}
            colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
            enableGridX={false}
          />
        </div>
      );
    }
  })();

  return (
    <StdPanel {...{ title, footnotes, sources }}>
      <Col size={5} isText>
        <TM
          k={text_keys_by_subject_type[subject.subject_type]}
          args={text_calculations}
        />
      </Col>
      <Col size={7} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
}

const common_panel_config = {
  get_title: () => text_maker("spend_rev_split_title"),
  render,
};

export const declare_spend_rev_split_panel = () =>
  declare_panel({
    panel_key: "spend_rev_split",
    subject_types: ["dept", "program"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "dept":
          return {
            ...common_panel_config,
            table_dependencies: ["orgSobjs"],
            footnotes: ["SOBJ_REV"],
            calculate: (subject, tables) => {
              const { orgSobjs } = tables;
              const last_year_spend = orgSobjs.sum_cols_by_grouped_data(
                "{{pa_last_year}}",
                "so_num",
                subject
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
          };
        case "program":
          return {
            ...common_panel_config,
            table_dependencies: ["programSobjs"],
            calculate: (subject, tables) => {
              const { programSobjs } = tables;
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
          };
      }
    },
  });
