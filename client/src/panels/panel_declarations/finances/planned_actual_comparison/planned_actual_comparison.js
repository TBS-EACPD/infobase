import React from "react";

import _ from "src/app_bootstrap/lodash_mixins.js";

import {
  declare_panel,
  FootNote,
  create_text_maker_component,
  TextPanel,
  get_source_links,
} from "../../shared.js";

import { PlannedActualTable } from "./PlannedActualTable.js";

import text from "./planned_actual_comparison.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export const declare_planned_actual_comparison_panel = () =>
  declare_panel({
    panel_key: "planned_actual_comparison",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSpending", "programFtes"],
      source: (subject) => get_source_links(["DP", "DRR", "PA"]),
      calculate(subject) {
        if (subject.level === "dept") {
          if (!subject.is_rpp_org) {
            return false;
          }
        } else if (!subject.dept.is_rpp_org) {
          return false;
        }

        const { programSpending, programFtes } = this.tables;
        const spend_q = programSpending.q(subject);
        const fte_q = programFtes.q(subject);

        const planned_spend = spend_q.sum("pa_last_year_planned");
        const planned_ftes = fte_q.sum("pa_last_year_planned");

        const actual_spend = spend_q.sum("{{pa_last_year}}exp");
        const actual_ftes = fte_q.sum("{{pa_last_year}}");

        //program has been dead before pa_last_year_planned
        if (!_.some([actual_spend, actual_ftes, planned_ftes, planned_spend])) {
          return false;
        }

        const footnotes = FootNote.get_for_subject(subject, [
          "DRR_EXP",
          "DRR_FTE",
        ]);

        const text_calculations = {
          subject,
          planned_spend: planned_spend,
          planned_ftes: planned_ftes,
          actual_spend: actual_spend,
          actual_ftes: actual_ftes,
          program_count_last_year:
            subject.level === "crso" &&
            _.chain(spend_q.data)
              .zip(fte_q.data)
              .filter(
                ([spend_row, fte_row]) =>
                  spend_row["{{pa_last_year}}exp"] !== 0 ||
                  fte_row["{{pa_last_year}}"] !== 0
              )
              .value().length,
        };

        return {
          text_calculations,
          planned_ftes,
          planned_spend,
          actual_ftes,
          actual_spend,
          diff_spend: actual_spend - planned_spend,
          diff_ftes: actual_ftes - planned_ftes,
          footnotes,
        };
      },

      render({ calculations, sources }) {
        const { panel_args, subject } = calculations;

        const {
          actual_spend,
          actual_ftes,
          planned_spend,
          planned_ftes,
          diff_ftes,
          diff_spend,
          footnotes,
          text_calculations,
        } = panel_args;

        return (
          <TextPanel
            title={text_maker("planned_actual_title")}
            footnotes={footnotes}
            sources={sources}
          >
            <TM
              k={`${subject.level}_planned_actual_text`}
              args={text_calculations}
            />
            <PlannedActualTable
              {...{
                actual_spend,
                actual_ftes,
                planned_spend,
                planned_ftes,
                diff_ftes,
                diff_spend,
              }}
            />
          </TextPanel>
        );
      },
    }),
  });
