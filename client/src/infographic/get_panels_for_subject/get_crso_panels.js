import { ensure_loaded } from '../../core/lazy_loader.js';

// crso only panels
import {
  declare_dead_crso_warning_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,
} from '../../panels/intro_graphs/index.js';
import {
  declare_crso_by_prog_fte_panel,
  declare_crso_by_prog_exp_panel,
} from "../../panels/drr_dp_resources/crso_by_prog.js";


export const get_crso_panels = subject => Promise.all([
  import('./common_global_panels.js'),
  import('./common_gov_dept_crso_program_panels.js'),
  import('./common_dept_crso_program_panels.js'),
  import('./common_crso_program_panels'),
  
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
        { declare_profile_panel },
      ] = modules;

      return {
        intro: [
          declare_dead_crso_warning_panel(),
          declare_profile_panel(),
          declare_crso_in_gov_panel(),
        ],
        financial: [
          declare_dead_crso_warning_panel(),
          declare_financial_intro_panel(),
          declare_welcome_mat_panel(),
          declare_budget_measures_panel(),
          declare_drr_planned_actual_panel(),
          declare_crso_by_prog_fte_panel(),
          declare_crso_by_prog_exp_panel(),
          declare_dp_rev_split_panel(),
        ],
        results: !subject.is_internal_service && subject.has_data('results_data') && [
          declare_results_intro_panel(),
          declare_late_dps_warning_panel(),
          declare_explore_results_panel(),
        ],
        related: [
          declare_crso_links_to_other_crso_panel(),
          declare_tags_of_interest_panel(),
        ],
      };
    }
  );