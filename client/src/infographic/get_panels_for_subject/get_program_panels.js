import { ensure_loaded } from '../../core/lazy_loader.js';

// program only panels
import {
  declare_dead_program_warning_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
} from '../../panels/intro_graphs/index.js';
import { declare_spending_in_tag_perspective_panel } from "../../panels/drr_dp_resources/spending_in_perspective.js";
import { declare_sub_program_resources_panel } from "../../panels/drr_dp_resources/sub_program_resources.js";


export const get_program_panels = subject => Promise.all([
  import('./common_global_panels.js'),
  import('./common_gov_dept_crso_program_panels.js'),
  import('./common_dept_crso_program_panels.js'),
  import('./common_dept_program_tag_panels.js'),
  import('./common_dept_program_panels.js'),
  import('./common_crso_program_panels'),
  import('./common_program_tag_panels'),
  
  // To be safe, ensure all used has_<data> checks are loaded
  ensure_loaded({
    subject: subject,
    has_results: true,
  }),
])
  .then(
    (modules) => {
      const [
        {
          declare_financial_intro_panel,
          declare_welcome_mat_panel,
        },
        {
          declare_results_intro_panel,
          declare_late_dps_warning_panel,
          declare_budget_measures_panel,
        },
        {
          declare_explore_results_panel,
          declare_tags_of_interest_panel,
          declare_drr_planned_actual_panel,
          declare_dp_rev_split_panel,
        },
        { declare_spend_rev_split_panel },
        { declare_drr_summary_panel },
        { declare_profile_panel },
        {
          declare_vote_stat_split_panel,
          declare_top_spending_areas_panel,
        },
      ] = modules;

      return {
        intro: [
          declare_dead_program_warning_panel(),
          declare_profile_panel(),
          declare_program_fed_structure_panel(),
        ],
        financial: [
          declare_dead_program_warning_panel(),
          declare_financial_intro_panel(),
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
          declare_results_intro_panel(),
          declare_late_dps_warning_panel(),
          declare_drr_summary_panel(),
          declare_explore_results_panel(),
        ],
        related: [
          declare_related_program_structure_panel(),
          declare_tags_of_interest_panel(),
        ],
      };
    }
  );