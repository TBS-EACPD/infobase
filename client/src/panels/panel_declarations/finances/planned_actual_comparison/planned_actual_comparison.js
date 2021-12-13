import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component } from "src/components/index";

import { PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC } from "src/models/footnotes/dynamic_footnotes";
import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";

import { get_source_links } from "src/metadata/data_sources";

import { PlannedActualTable } from "./PlannedActualTable";

import text from "./planned_actual_comparison.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export const declare_planned_actual_comparison_panel = () =>
  declare_panel({
    panel_key: "planned_actual_comparison",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type, panel_key) => ({
      depends_on: ["programSpending", "programFtes"],
      title: text_maker("planned_actual_title"),
      source: (subject) => get_source_links(["DP", "DRR", "PA"]),
      calculate(subject) {
        if (subject.subject_type === "dept") {
          if (
            !subject.is_dp_org ||
            _.includes(
              PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC.late_resources_orgs,
              subject.id
            )
          ) {
            return false;
          }
        } else {
          if (
            !subject.dept.is_dp_org ||
            _.includes(
              PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC.late_resources_orgs,
              subject.dept.id
            )
          ) {
            return false;
          }
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

        const footnotes = get_footnotes_by_subject_and_topic(subject, [
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
            subject.subject_type === "crso" &&
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

      render({ title, calculations, sources }) {
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
          <TextPanel {...{ title, footnotes, sources }}>
            <TM
              k={`${subject.subject_type}_planned_actual_text`}
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
