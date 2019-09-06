import { get_people_panels } from './get_people_panels.js';
import { ensure_loaded } from '../../core/lazy_loader.js';

// dept only panels
import {
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
} from '../../panels/intro_graphs/index.js';
import { declare_estimates_in_perspective_panel } from "../../panels/vote_stat/estimates_in_perspective.js";
import { declare_spend_by_so_hist_panel } from "../../panels/sobj/spend_by_so_hist.js";
import { declare_igoc_fields_panel } from '../../panels/igoc/igoc_panel.js';
import { declare_last_year_g_and_c_perspective_panel } from "../../panels/transfer_payments/last_year_g_and_c_perspective.js";
//import { declare_internal_services_panel } from '../../panels/internal_services/isc.js';


export const get_dept_panels = subject => Promise.all([
  import('./common_global_panels.js'),
  import('./common_gov_dept_crso_program_panels.js'),
  import('./common_dept_crso_program_panels.js'),
  import('./common_dept_program_tag_panels.js'),
  import('./common_gov_dept_panels.js'),
  import('./common_dept_program_panels.js'),
  import('./common_dept_tag_panels'),
  
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
        {
          declare_links_to_rpb_panel,
          declare_in_year_voted_stat_split_panel,
          //declare_in_year_estimates_split_panel,
          declare_historical_g_and_c_panel,
          declare_auth_exp_prog_spending_panel,
        },
        { declare_drr_summary_panel },
        { declare_detailed_program_spending_split_panel },
      ] = modules;

      return {
        intro: [
          declare_igoc_fields_panel(),
          declare_portfolio_structure_intro_panel(),
        ],
        financial: _.includes(subject.tables, 'programSpending') && [
          declare_financial_intro_panel(),
          declare_welcome_mat_panel(),
          declare_budget_measures_panel(),
          declare_auth_exp_prog_spending_panel(),
          declare_estimates_in_perspective_panel(),
          //declare_in_year_estimates_split_panel(),//turned off until supps A
          declare_in_year_voted_stat_split_panel(),
          declare_spend_by_so_hist_panel(),
          declare_last_year_g_and_c_perspective_panel(),
          declare_historical_g_and_c_panel(),
          declare_spend_rev_split_panel(),
          declare_detailed_program_spending_split_panel(),
          declare_drr_planned_actual_panel(),
          declare_dp_rev_split_panel(),
        ],
        people: _.includes(subject.tables, 'orgEmployeeType') && get_people_panels(subject),
        results: subject.has_data('results_data') && [
          declare_results_intro_panel(),
          declare_late_dps_warning_panel(),
          declare_drr_summary_panel(),
          declare_explore_results_panel(),
        ],
        related: _.nonEmpty(subject.programs) && [
          declare_portfolio_structure_related_panel(),
          declare_tags_of_interest_panel(),
        ],
        all_data: _.nonEmpty(subject.tables) && [
          declare_links_to_rpb_panel(),
        ],
      };
    }
  );