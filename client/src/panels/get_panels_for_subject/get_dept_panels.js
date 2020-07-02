import _ from "lodash";

import { ensure_loaded } from "../../core/lazy_loader.js";
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

  // shared dept, program
  declare_spend_rev_split_panel,

  // shared gov, dept
  declare_tp_by_region_panel,
  declare_links_to_rpb_panel,
  declare_in_year_voted_stat_split_panel,
  declare_in_year_estimates_split_panel,
  declare_historical_g_and_c_panel,
  declare_auth_exp_planned_spending_panel,
  declare_people_key_concepts_panel,
  declare_employee_totals_panel,
  declare_employee_prov_panel,
  declare_employee_type_panel,
  declare_employee_age_panel,
  declare_employee_executive_level_panel,
  declare_employee_fol_panel,
  declare_employee_gender_panel,
  declare_results_intro_panel,
  declare_covid_estimates_panel,

  // dept only panels
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
  declare_estimates_in_perspective_panel,
  declare_spend_by_so_hist_panel,
  declare_last_year_g_and_c_perspective_panel,
  declare_internal_services_panel,
  declare_employee_last_year_totals_panel,
  declare_detailed_program_spending_split_panel,
  declare_provided_services_list_panel,
  declare_services_fees_panel,
  declare_services_id_methods_panel,
  declare_services_channels_panel,
  declare_services_digital_status_panel,
} from "../../panels/panel_declarations/index.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_dept_panels = (subject) =>
  ensure_loaded({
    subject: subject,
    has_results: true,
    has_services: true,
  }).then(() => ({
    intro: [declare_profile_panel(), declare_portfolio_structure_intro_panel()],
    financial: _.includes(subject.tables, "programSpending") && [
      declare_financial_key_concepts_panel(),
      declare_late_actual_resources_panel(),
      declare_late_planned_resources_panel(),
      declare_welcome_mat_panel(),
      declare_auth_exp_planned_spending_panel(),
      declare_in_year_estimates_split_panel(),
      declare_covid_estimates_panel(),
      declare_in_year_voted_stat_split_panel(),
      declare_estimates_in_perspective_panel(),
      declare_tp_by_region_panel(),
      declare_spend_by_so_hist_panel(),
      declare_last_year_g_and_c_perspective_panel(),
      declare_historical_g_and_c_panel(),
      declare_spend_rev_split_panel(),
      declare_detailed_program_spending_split_panel(),
      declare_internal_services_panel(),
      declare_planned_actual_comparison_panel(),
      declare_dp_rev_split_panel(),
    ],
    people: _.includes(subject.tables, "orgEmployeeType") && [
      declare_people_key_concepts_panel(),
      declare_employee_last_year_totals_panel(),
      declare_employee_totals_panel(),
      declare_employee_prov_panel(),
      declare_employee_type_panel(),
      declare_employee_age_panel(),
      declare_employee_executive_level_panel(),
      declare_employee_fol_panel(),
      declare_employee_gender_panel(),
    ],
    services: subject.has_data("services_data") && [
      declare_provided_services_list_panel(),
      declare_services_digital_status_panel(),
      declare_services_fees_panel(),
      declare_services_id_methods_panel(),
      declare_services_channels_panel(),
    ],
    results: subject.has_data("results_data") && [
      declare_results_key_concepts_panel(),
      declare_late_results_warning_panel(),
      declare_late_actual_resources_panel(),
      declare_late_planned_resources_panel(),
      declare_results_intro_panel(),
      declare_drr_summary_panel(),
      declare_results_table_panel(),
      declare_explore_results_panel(),
    ],
    related: !_.isEmpty(subject.programs) && [
      declare_portfolio_structure_related_panel(),
      declare_tags_of_interest_panel(),
    ],
    all_data: !_.isEmpty(subject.tables) && [declare_links_to_rpb_panel()],
  }));
