import { ensure_loaded } from '../../core/lazy_loader.js';

import {
  // shared all
  declare_welcome_mat_panel,
  declare_financial_key_concepts_panel,

  // shared gov, dept, crso, program
  declare_results_key_concepts_panel,
  declare_late_dps_warning_panel,
  declare_budget_measures_panel,
  declare_year_warning_panel,
  declare_results_intro_panel,

  // shared dept, crso, program, tag
  declare_profile_panel,

  // shared dept, crso, program
  declare_explore_results_panel,
  declare_results_table_panel,
  declare_tags_of_interest_panel,
  declare_drr_planned_actual_panel,
  declare_dp_rev_split_panel,
  declare_drr_summary_panel,

  // shared dept, program, tag
  declare_spend_rev_split_panel,

  // shared program, tag
  declare_vote_stat_split_panel,
  declare_top_spending_areas_panel,

  // program only panels
  declare_dead_program_warning_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
  declare_spending_in_tag_perspective_panel,
  declare_sub_program_resources_panel,
} from '../panel_declarations/index.js';

// To be safe, ensure all used has_<data> checks are loaded
export const get_program_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    declare_dead_program_warning_panel(),
    declare_profile_panel(),
    declare_program_fed_structure_panel(),
  ],
  financial: [
    declare_dead_program_warning_panel(),
    declare_year_warning_panel(),
    declare_financial_key_concepts_panel(),
    declare_welcome_mat_panel(),
    declare_budget_measures_panel(),
    declare_vote_stat_split_panel(),
    declare_spend_rev_split_panel(),
    declare_top_spending_areas_panel(),
    declare_spending_in_tag_perspective_panel(),
    declare_drr_planned_actual_panel(),
    declare_sub_program_resources_panel(),
    declare_dp_rev_split_panel(),
  ],
  results: !subject.is_internal_service && subject.has_data('results_data') && [
    declare_results_key_concepts_panel(),
    declare_results_intro_panel(),
    declare_late_dps_warning_panel(),
    declare_drr_summary_panel(),
    declare_results_table_panel(),
    declare_explore_results_panel(),
  ],
  related: [
    declare_related_program_structure_panel(),
    declare_tags_of_interest_panel(),
  ],
}) );