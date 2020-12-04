import React from "react";

import { is_a11y_mode } from "src/app_bootstrap/globals.js";

import {
  StdPanel,
  Col,
  WrappedNivoPie,
  declare_panel,
  year_templates,
} from "../../shared.js";
const { std_years } = year_templates;

import { text_maker, TM } from "./vote_stat_text_provider.js";

const render_w_options = ({ text_key, graph_col, text_col }) => ({
  calculations,
  sources,
  footnotes,
  glossary_keys,
}) => {
  const { panel_args } = calculations;
  const { vote_stat, text_calculations } = panel_args;

  const data = _.map(vote_stat, (data_set) => ({
    ...data_set,
    id: data_set.label,
  }));

  return (
    <StdPanel
      title={text_maker("vote_stat_split_title")}
      {...{ footnotes, sources, glossary_keys }}
    >
      <Col isText size={text_col}>
        <TM k={text_key} args={text_calculations} />
      </Col>
      {!is_a11y_mode && (
        <Col isGraph size={graph_col}>
          <WrappedNivoPie data={data} />
        </Col>
      )}
    </StdPanel>
  );
};

export const declare_vote_stat_split_panel = () =>
  declare_panel({
    panel_key: "vote_stat_split",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programVoteStat"],
      footnotes: ["VOTED", "STAT"],
      glossary_keys: ["AUTH"],

      calculate(subject, options) {
        const { programVoteStat } = this.tables;

        const vote_stat = _.map(
          programVoteStat.programs.get(subject),
          (row) => ({
            label: row.vote_stat,
            value: row["{{pa_last_year}}"],
          })
        );

        // check for either negative voted or statutory values, or 0 for both
        if (
          _.every(vote_stat, ({ value }) => value === 0) ||
          (_.minBy(vote_stat, "value").value < 0 &&
            _.maxBy(vote_stat, "value").value >= 0)
        ) {
          return false;
        }

        const last_year_col = _.last(std_years);
        const last_year_col_obj = programVoteStat.col_from_nick(last_year_col);

        const rows = programVoteStat.q(subject).data;
        const {
          [text_maker("voted")]: voted_rows,
          [text_maker("stat")]: stat_rows,
        } = _.groupBy(rows, "vote_stat");

        const voted_exp = voted_rows
          ? last_year_col_obj.formula(voted_rows)
          : 0;
        const stat_exp = stat_rows ? last_year_col_obj.formula(stat_rows) : 0;

        const total_exp = voted_exp + stat_exp;
        const voted_pct = voted_exp / total_exp;
        const stat_pct = stat_exp / total_exp;

        const text_calculations = {
          total_exp,
          stat_pct,
          voted_pct,
          stat_exp,
          voted_exp,
        };

        return { vote_stat, text_calculations };
      },

      render: render_w_options({
        text_key: "program_vote_stat_split_text",
        graph_col: 7,
        text_col: 5,
      }),
    }),
  });
