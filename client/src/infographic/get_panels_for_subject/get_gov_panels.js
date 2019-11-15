import { get_people_panels } from './get_people_panels.js';

import {
  // shared all
  declare_welcome_mat_panel,
  declare_financial_key_concepts_panel,

  // shared gov, dept, crso, program
  declare_results_key_concepts_panel,
  declare_late_dps_warning_panel,
  declare_budget_measures_panel,
  declare_year_warning_panel,

  // shared gov, dept
  declare_links_to_rpb_panel,
  declare_in_year_voted_stat_split_panel,
  //declare_in_year_estimates_split_panel,
  declare_historical_g_and_c_panel,
  declare_auth_exp_prog_spending_panel,

  // gov only panels
  declare_simplographic_panel,
  declare_gov_related_info_panel,
  declare_gov_drr_panel,
  declare_gov_dp_panel,
  declare_in_year_voted_breakdown_panel,
  declare_in_year_stat_breakdown_panel,
  declare_gocographic_panel,
  declare_personnel_spend_panel,
} from '../../panels/panel_declarations/index.js';

export const get_gov_panels = subject => ({
  intro: [
    declare_simplographic_panel(),
  ],
  financial: [
    declare_year_warning_panel(),
    declare_financial_key_concepts_panel(),
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
    declare_results_key_concepts_panel(),
    declare_late_dps_warning_panel(),
    declare_gov_drr_panel(),
    declare_gov_dp_panel(),
  ],
  related: [ declare_gov_related_info_panel() ],
  all_data: [ declare_links_to_rpb_panel() ],
});