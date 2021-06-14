import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import FootNote from "src/models/footnotes/footnotes";

import { Subject } from "src/models/subject";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoCircleProportion } from "src/charts/wrapped_nivo/index";

import { TM, text_maker } from "./vote_stat_text_provider";
const { Gov } = Subject;
const est_in_year_col = "{{est_in_year}}_estimates";

export const declare_estimates_in_perspective_panel = () =>
  declare_panel({
    panel_key: "estimates_in_perspective",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("estimates_perspective_title"),
      depends_on: ["orgVoteStatEstimates"],
      machinery_footnotes: false,
      calculate(subject, options) {
        const { orgVoteStatEstimates } = this.tables;
        const gov_q = orgVoteStatEstimates.q(Gov);
        const dept_q = orgVoteStatEstimates.q(subject);
        const gov_tabled_est_in_year = gov_q.sum(est_in_year_col);
        const dept_tabled_est_in_year = dept_q.sum(est_in_year_col);

        if (!dept_tabled_est_in_year) {
          return false;
        }
        return {
          subject,
          gov_tabled_est_in_year,
          dept_tabled_est_in_year,
        };
      },

      render({ title, calculations, footnotes, sources }) {
        const { panel_args } = calculations;
        const { subject, gov_tabled_est_in_year, dept_tabled_est_in_year } =
          panel_args;

        footnotes = _.concat(
          new FootNote({
            subject,
            text: text_maker("auth_footnote"),
            topic_keys: ["AUTH"],
          }),
          footnotes
        );
        return (
          <StdPanel {...{ title, footnotes, sources }} allowOverflow={true}>
            <Col isText size={!is_a11y_mode ? 5 : 12}>
              <TM k="estimates_perspective_text" args={panel_args} />
            </Col>
            {!is_a11y_mode && (
              <Col isGraph size={7}>
                <WrappedNivoCircleProportion
                  height={250}
                  child_value={dept_tabled_est_in_year}
                  child_name={text_maker("dept_estimates", { subject })}
                  parent_value={gov_tabled_est_in_year}
                  parent_name={text_maker("gov_estimates")}
                />
              </Col>
            )}
          </StdPanel>
        );
      },
    }),
  });
