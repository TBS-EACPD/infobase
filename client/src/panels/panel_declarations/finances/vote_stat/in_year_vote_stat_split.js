import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import { text_maker, TM } from "./vote_stat_text_provider";

const voted = text_maker("voted");
const stat = text_maker("stat");
const main_col = "{{est_in_year}}_estimates";

const render_w_options =
  ({ graph_col, text_col, text_key }) =>
  ({ title, calculations, footnotes, sources, glossary_keys }) => {
    const { panel_args } = calculations;
    const { vote_stat_est_in_year, text_calculations } = panel_args;

    const data = _.map(vote_stat_est_in_year, (data_set) => ({
      ...data_set,
      id: data_set.label,
    }));

    return (
      <StdPanel {...{ title, sources, footnotes, glossary_keys }}>
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

const get_vote_stat_est_in_year = (table, subject) => {
  const voted_stat = table.voted_stat(main_col, subject, true);
  return [
    { value: voted_stat[stat] || 0, label: stat },
    {
      value: voted_stat[voted] || 0,
      label: voted,
    },
  ];
};
const get_text_calculations = (table, subject) => {
  const voted_stat = table.voted_stat(main_col, subject, true);
  const q = table.q(subject);
  const stat_est_in_year = voted_stat[stat] || 0;
  const voted_est_in_year = voted_stat[voted] || 0;
  const tabled_est_in_year = q.sum(main_col);
  return {
    subject,
    stat_est_in_year,
    voted_est_in_year,
    tabled_est_in_year,
    voted_percent_est_in_year: voted_est_in_year / tabled_est_in_year,
    stat_percent_est_in_year: stat_est_in_year / tabled_est_in_year,
  };
};

const common_panel_config = {
  depends_on: ["orgVoteStatEstimates"],
  machinery_footnotes: false,
  glossary_keys: ["AUTH"],
  title: text_maker("in_year_voted_stat_split_title"),
};

export const declare_in_year_voted_stat_split_panel = () =>
  declare_panel({
    panel_key: "in_year_voted_stat_split",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            ...common_panel_config,
            calculate(subject) {
              const { orgVoteStatEstimates } = this.tables;
              const vote_stat_est_in_year = get_vote_stat_est_in_year(
                orgVoteStatEstimates,
                subject
              );
              const text_calculations = get_text_calculations(
                orgVoteStatEstimates,
                subject
              );
              return {
                vote_stat_est_in_year,
                text_calculations,
              };
            },
            render: render_w_options({
              text_key: "gov_in_year_voted_stat_split_text",
              text_col: 7,
              graph_col: 5,
            }),
          };
        case "dept":
          return {
            ...common_panel_config,
            calculate(subject) {
              const { orgVoteStatEstimates } = this.tables;
              const vote_stat_est_in_year = get_vote_stat_est_in_year(
                orgVoteStatEstimates,
                subject
              );
              const stat_est_in_year = vote_stat_est_in_year[0].value;
              const vote_est_in_year = vote_stat_est_in_year[1].value;
              const text_calculations = get_text_calculations(
                orgVoteStatEstimates,
                subject
              );
              // check for either negative voted or statutory values, or 0 for both
              if (
                (stat_est_in_year < 0 && vote_est_in_year >= 0) ||
                (vote_est_in_year < 0 && stat_est_in_year >= 0) ||
                (stat_est_in_year === 0 && stat_est_in_year === 0)
              ) {
                return false;
              }
              return { vote_stat_est_in_year, text_calculations };
            },
            render: render_w_options({
              text_key: "dept_in_year_voted_stat_split_text",
              graph_col: 6,
              text_col: 6,
            }),
          };
      }
    },
  });
