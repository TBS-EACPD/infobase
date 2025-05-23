import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { SingleTagResourceExplorer } from "./rooted_resource_scheme";

import { text_maker, actual_year, planning_year } from "./utils";

export const declare_resource_structure_panel = () =>
  declare_panel({
    panel_key: "resource_structure",
    subject_types: ["tag"],

    panel_config_func: () => ({
      get_title: () => text_maker("resource_structure_title"),
      legacy_table_dependencies: ["programSpending", "programFtes"],
      get_dataset_keys: () => ["program_spending", "program_ftes"],

      calculate: ({ subject, tables }) => {
        const { programSpending } = tables;

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

      render({ title, subject, calculations }) {
        const { has_planning_data, has_actual_data } = calculations;

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
