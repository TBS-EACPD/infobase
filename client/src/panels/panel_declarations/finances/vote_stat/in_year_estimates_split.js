import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import {
  highlightColor,
  secondaryColor,
  textColor,
} from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { formats } from "../../../../core/format.js";
import {
  StdPanel,
  Col,
  WrappedNivoBar,
  declare_panel,
  businessConstants,
} from "../../shared.js";

import { text_maker, TM } from "./vote_stat_text_provider.js";

const { estimates_docs } = businessConstants;
const est_in_year_col = "{{est_in_year}}_estimates";

const estimates_split_calculate = function (subject) {
  const { orgVoteStatEstimates } = this.tables;
  const q = orgVoteStatEstimates.q(subject);
  const dept_id = subject.level === "gov" ? false : subject.id;

  const in_year_estimates_split = _.chain(
    orgVoteStatEstimates.by_estimates_doc(est_in_year_col, dept_id, false)
  )
    .toPairs()
    .sortBy(
      (est_doc_lines) => estimates_docs[est_doc_lines[1][0].est_doc_code].order
    )
    .map((est_doc_lines) => {
      const est_amnt = sum(_.map(est_doc_lines[1], est_in_year_col));
      return [est_doc_lines[0], est_amnt];
    })
    .filter((row) => row[1] !== 0)
    .value();

  const calculations = {
    subject,
    tabled_est_in_year: q.sum(est_in_year_col),
    in_year_estimates_split,
  };
  if (_.isEmpty(in_year_estimates_split)) {
    return false;
  }
  return calculations;
};

const estimates_split_render_w_text_key = (text_key) => ({
  calculations,
  footnotes,
  sources,
}) => {
  const { panel_args } = calculations;
  const { in_year_estimates_split } = panel_args;
  const estimate_data = _.map(in_year_estimates_split, ([tick, data]) => ({
    label: tick,
    [tick]: data,
  }));

  const content = (
    <WrappedNivoBar
      data={estimate_data}
      keys={_.map(estimate_data, "label")}
      label_format={(d) => <tspan y={-10}>{formats.compact2_raw(d)}</tspan>}
      isInteractive={false}
      enableLabel={true}
      indexBy="label"
      colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
      margin={{
        top: 50,
        right: 40,
        bottom: 120,
        left: 40,
      }}
      bttm_axis={{
        format: (d) => (_.words(d).length > 3 ? d.substring(0, 20) + "..." : d),
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      }}
      graph_height="450px"
      enableGridX={false}
      remove_left_axis={true}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: textColor,
              fontWeight: "550",
            },
          },
        },
      }}
    />
  );

  return (
    <StdPanel
      title={text_maker("in_year_estimates_split_title")}
      {...{ sources, footnotes }}
    >
      <Col isText size={6}>
        <TM k={text_key} args={panel_args} />
      </Col>
      <Col isGraph={is_a11y_mode} size={6}>
        {content}
      </Col>
    </StdPanel>
  );
};

export const declare_in_year_estimates_split_panel = () =>
  declare_panel({
    panel_key: "in_year_estimates_split",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            machinery_footnotes: false,
            depends_on: ["orgVoteStatEstimates"],
            calculate: estimates_split_calculate,
            render: estimates_split_render_w_text_key(
              "gov_in_year_estimates_split_text"
            ),
          };
        case "dept":
          return {
            machinery_footnotes: false,
            depends_on: ["orgVoteStatEstimates"],
            calculate: estimates_split_calculate,
            render: estimates_split_render_w_text_key(
              "dept_in_year_estimates_split_text"
            ),
          };
      }
    },
  });
