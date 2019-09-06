import { get_people_panels } from './get_people_panels.js';

// gov only panels
import {
  declare_simplographic_panel,
  declare_gov_related_info_panel,
} from '../../panels/intro_graphs/index.js';
import {
  declare_gov_drr_panel,
  declare_gov_dp_panel,
} from '../../panels/result_graphs/index.js';
import {
  declare_in_year_voted_breakdown_panel,
  declare_in_year_stat_breakdown_panel,
} from "../../panels/vote_stat/in_year_vote_stat_breakdown.js";
import { declare_gocographic_panel } from '../../panels/tag_panels/goco.js';
import { declare_personnel_spend_panel } from "../../panels/sobj/personel_spend.js";


export const get_gov_panels = subject => Promise.all([
  import('./common_global_panels.js'),
  import('./common_gov_dept_crso_program_panels.js'),
  import('./common_gov_dept_panels.js'),
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
          declare_links_to_rpb_panel,
          declare_in_year_voted_stat_split_panel,
          //declare_in_year_estimates_split_panel,
          declare_historical_g_and_c_panel,
          declare_auth_exp_prog_spending_panel,
        },
      ] = modules;

      return {
        intro: [
          declare_simplographic_panel(),
        ],
        financial: [
          declare_financial_intro_panel(),
          declare_welcome_mat_panel(),
          declare_budget_measures_panel(),
          declare_auth_exp_prog_spending_panel(),
          //declare_in_year_estimates_split_panel(),//turned off until supps A
          declare_in_year_voted_stat_split_panel(),
          declare_in_year_stat_breakdown_panel(),
          declare_in_year_voted_breakdown_panel(),
          declare_gocographic_panel(),
          declare_historical_g_and_c_panel(),
          declare_personnel_spend_panel(),
        ],
        people: get_people_panels(subject),
        results: [
          declare_results_intro_panel(),
          declare_late_dps_warning_panel(),
          declare_gov_drr_panel(),
          declare_gov_dp_panel(),
        ],
        related: [ declare_gov_related_info_panel() ],
        all_data: [ declare_links_to_rpb_panel() ],
      };
    }
  );