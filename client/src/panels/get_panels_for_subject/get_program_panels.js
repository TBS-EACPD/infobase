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

  // shared gov, dept, program
  declare_services_types_panel,
  declare_services_digital_status_panel,
  declare_services_fees_panel,
  declare_services_id_methods_panel,
  declare_services_standards_panel,
  declare_top10_website_visits_panel,

  // shared dept, program,
  declare_spend_rev_split_panel,
  declare_provided_services_list_panel,
  declare_services_channels_panel,
  declare_top10_services_application_volume_panel,

  // program only panels
  declare_dead_program_warning_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
  declare_spending_in_tag_perspective_panel,
  declare_vote_stat_split_panel,
  declare_top_spending_areas_panel,
} from "src/panels/panel_declarations/index.js";

import { ensure_loaded } from "src/core/ensure_loaded.js";
import { services_feature_flag } from "src/core/injected_build_constants";

// To be safe, ensure all used has_<data> checks are loaded
export const get_program_panels = (subject) =>
  ensure_loaded({
    subject: subject,
    has_results: true,
    has_services: services_feature_flag,
  }).then(() => ({
    intro: [
      declare_dead_program_warning_panel(),
      declare_profile_panel(),
      declare_program_fed_structure_panel(),
    ],
    financial: [
      declare_financial_key_concepts_panel(),
      declare_dead_program_warning_panel(),
      declare_late_actual_resources_panel(),
      declare_late_planned_resources_panel(),
      declare_welcome_mat_panel(),
      declare_vote_stat_split_panel(),
      declare_spend_rev_split_panel(),
      declare_top_spending_areas_panel(),
      declare_spending_in_tag_perspective_panel(),
      declare_planned_actual_comparison_panel(),
      declare_dp_rev_split_panel(),
    ],
    services: services_feature_flag &&
      subject.has_data("services") && [
        declare_provided_services_list_panel(),
        declare_services_types_panel(),
        declare_services_digital_status_panel(),
        declare_services_id_methods_panel(),
        declare_services_channels_panel(),
        declare_top10_services_application_volume_panel(),
        declare_top10_website_visits_panel(),
        declare_services_fees_panel(),
        declare_services_standards_panel(),
      ],
    results: !subject.is_internal_service &&
      subject.has_data("results") && [
        declare_results_key_concepts_panel(),
        declare_late_results_warning_panel(),
        declare_late_actual_resources_panel(),
        declare_late_planned_resources_panel(),
        declare_dead_program_warning_panel(),
        declare_drr_summary_panel(),
        declare_results_table_panel(),
        declare_explore_results_panel(),
      ],
    related: [
      declare_dead_program_warning_panel(),
      declare_related_program_structure_panel(),
      declare_tags_of_interest_panel(),
    ],
  }));
