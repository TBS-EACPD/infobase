import _ from "lodash";
import React from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_footnote } from "src/models/footnotes/footnotes";

import { Gov } from "src/models/subjects";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { CircleProportionGraph } from "src/charts/wrapped_nivo/index";

import { TM, text_maker } from "./vote_stat_text_provider";

const est_in_year_col = "{{est_in_year}}_estimates";

export const declare_estimates_in_perspective_panel = () =>
  declare_panel({
    panel_key: "estimates_in_perspective",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_title: () => text_maker("estimates_perspective_title"),
      legacy_table_dependencies: ["orgVoteStatEstimates"],
      get_dataset_keys: () => ["tabled_estimates"],
      machinery_footnotes: false,
      calculate: ({ subject, tables }) => {
        const { orgVoteStatEstimates } = tables;
        const gov_q = orgVoteStatEstimates.q(Gov.instance);
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

      render({ title, subject, calculations, footnotes, sources }) {
        const { gov_tabled_est_in_year, dept_tabled_est_in_year } =
          calculations;

        footnotes = _.concat(
          create_footnote({
            id: text_maker("auth_footnote"),
            subject_type: subject.subject_type,
            subject_id: subject.id,
            text: text_maker("auth_footnote"),
            topic_keys: ["AUTH"],
          }),
          footnotes
        );
        return (
          <StdPanel {...{ title, footnotes, sources }} allowOverflow={true}>
            <Col isText size={!is_a11y_mode ? 5 : 12}>
              <TM k="estimates_perspective_text" args={calculations} />
            </Col>
            {!is_a11y_mode && (
              <Col isGraph size={7}>
                <CircleProportionGraph
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
