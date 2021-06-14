import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { SingleTagResourceExplorer } from "./rooted_resource_scheme";

import { text_maker, actual_year, planning_year } from "./utils";

export const declare_resource_structure_panel = () =>
  declare_panel({
    panel_key: "resource_structure",
    levels: ["tag"],

    panel_config_func: (level, panel_key) => ({
      footnotes: false,
      title: text_maker("resource_structure_title"),
      depends_on: ["programSpending", "programFtes"],

      calculate(subject) {
        const { programSpending } = this.tables;

        const has_some_program_spending_for_year = (resource_year) =>
          _.some(subject.programs, (program) =>
            _.some(
              programSpending.programs.get(program),
              (row) =>
                _.isNumber(row[resource_year]) && row[resource_year] !== 0
            )
          );

        const has_actual_data = has_some_program_spending_for_year(
          `${actual_year}exp`
        );
        const has_planning_data =
          has_some_program_spending_for_year(planning_year);

        return (
          (has_planning_data || has_actual_data) && {
            has_planning_data,
            has_actual_data,
          }
        );
      },

      render({ title, calculations }) {
        const {
          subject,
          panel_args: { has_planning_data, has_actual_data },
        } = calculations;

        const explorer_instance = new SingleTagResourceExplorer(
          subject,
          has_planning_data,
          has_actual_data
        );

        return (
          <InfographicPanel title={title}>
            {explorer_instance.to_react_element({
              subject,
              has_planning_data,
              has_actual_data,
            })}
          </InfographicPanel>
        );
      },
    }),
  });
