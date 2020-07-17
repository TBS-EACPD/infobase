import text from "./planned_actual_comparison.yaml";

import { PlannedActualTable } from "./PlannedActualTable.js";

import {
  declare_panel,
  FootNote,
  create_text_maker_component,
  TextPanel,
  get_source_links,
} from "../../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

export const declare_planned_actual_comparison_panel = () =>
  declare_panel({
    panel_key: "planned_actual_comparison",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSpending", "programFtes"],
      info_deps:
        level === "crso"
          ? ["programSpending_crso_info", "programFtes_crso_info"]
          : [],
      source: (subject) => get_source_links(["DP", "DRR", "PA"]),
      calculate(subject, info) {
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

        return {
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
        const { panel_args, subject, info } = calculations;

        const {
          actual_spend,
          actual_ftes,
          planned_spend,
          planned_ftes,
          diff_ftes,
          diff_spend,
          footnotes,
        } = panel_args;

        return (
          <TextPanel
            title={text_maker("planned_actual_title")}
            footnotes={footnotes}
            sources={sources}
          >
            <TM
              k={`${subject.level}_planned_actual_text`}
              args={{
                ...panel_args,
                subject,
                crso_prg_num:
                  subject.level === "crso" &&
                  _.max([info.crso_fte_prg_num, info.crso_exp_prg_num]),
              }}
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
