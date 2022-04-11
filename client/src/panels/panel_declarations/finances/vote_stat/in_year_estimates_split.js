import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import { estimates_docs } from "src/models/estimates";

import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import {
  highlightColor,
  secondaryColor,
  textColor,
} from "src/style_constants/index";
import { filter_row_by_subj } from "src/tables/TableClass";

import { text_maker, TM } from "./vote_stat_text_provider";

const est_in_year_col = "{{est_in_year}}_estimates";

const estimates_split_calculate = function (subject) {
  const { orgVoteStatEstimates } = this.tables;
  const q = orgVoteStatEstimates.q(subject);

  const in_year_estimates_split = _.chain(orgVoteStatEstimates.data)
    .filter((row) => filter_row_by_subj(row, subject))
    .groupBy("est_doc")
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

const estimates_split_render_w_text_key =
  (text_key) =>
  ({ title, calculations, footnotes, sources }) => {
    const { in_year_estimates_split } = calculations;
    const estimate_data = _.map(in_year_estimates_split, ([tick, data]) => ({
      label: tick,
      [tick]: data,
    }));

    const content = (
      <WrappedNivoBar
        data={estimate_data}
        keys={_.map(estimate_data, "label")}
        label={(d) => (
          <tspan y={-10}>{formats.compact2_raw(d.formattedValue)}</tspan>
        )}
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
          format: (d) =>
            _.words(d).length > 3 ? d.substring(0, 20) + "..." : d,
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
      <StdPanel {...{ title, sources, footnotes }}>
        <Col isText size={6}>
          <TM k={text_key} args={calculations} />
        </Col>
        <Col isGraph={is_a11y_mode} size={6}>
          {content}
        </Col>
      </StdPanel>
    );
  };

const common_panel_config = {
  machinery_footnotes: false,
  table_dependencies: ["orgVoteStatEstimates"],
  get_title: () => text_maker("in_year_estimates_split_title"),
  calculate: estimates_split_calculate,
};

export const declare_in_year_estimates_split_panel = () =>
  declare_panel({
    panel_key: "in_year_estimates_split",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "gov":
          return {
            ...common_panel_config,
            render: estimates_split_render_w_text_key(
              "gov_in_year_estimates_split_text"
            ),
          };
        case "dept":
          return {
            ...common_panel_config,
            render: estimates_split_render_w_text_key(
              "dept_in_year_estimates_split_text"
            ),
          };
      }
    },
  });
