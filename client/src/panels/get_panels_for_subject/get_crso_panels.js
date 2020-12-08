import { ensure_loaded } from "../../core/ensure_loaded.js";

import {
  // shared all
  declare_welcome_mat_panel,
  declare_financial_key_concepts_panel,

  // shared gov, dept, crso, program
  declare_results_key_concepts_panel,
  declare_late_results_warning_panel,
  declare_late_actual_resources_panel,
  declare_late_planned_resources_panel,

  // shared dept, crso, program, tag
  declare_profile_panel,

  // shared dept, crso, program
  declare_explore_results_panel,
  declare_results_table_panel,
  declare_tags_of_interest_panel,
  declare_planned_actual_comparison_panel,
  declare_dp_rev_split_panel,
  declare_drr_summary_panel,

  // crso only panels
  declare_dead_crso_warning_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,
  declare_crso_by_prog_fte_panel,
  declare_crso_by_prog_exp_panel,
} from "../panel_declarations/index.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_crso_panels = (subject) =>
  ensure_loaded({
    subject: subject,
    has_results: true,
  }).then(() => ({
    intro: [
      declare_dead_crso_warning_panel(),
      declare_profile_panel(),
      declare_crso_in_gov_panel(),
    ],
    financial: [
      declare_financial_key_concepts_panel(),
      declare_dead_crso_warning_panel(),
      declare_late_actual_resources_panel(),
      declare_late_planned_resources_panel(),
      declare_welcome_mat_panel(),
      declare_planned_actual_comparison_panel(),
      declare_crso_by_prog_fte_panel(),
      declare_crso_by_prog_exp_panel(),
      declare_dp_rev_split_panel(),
    ],
    results: !subject.is_internal_service &&
      subject.has_data("results") && [
        declare_dead_crso_warning_panel(),
        declare_results_key_concepts_panel(),
        declare_late_actual_resources_panel(),
        declare_late_planned_resources_panel(),
        declare_late_results_warning_panel(),
        declare_drr_summary_panel(),
        declare_results_table_panel(),
        declare_explore_results_panel(),
      ],
    related: [
      declare_dead_crso_warning_panel(),
      declare_crso_links_to_other_crso_panel(),
      declare_tags_of_interest_panel(),
    ],
  }));
