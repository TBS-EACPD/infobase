import { get_people_panels } from './get_people_panels.js';
import { ensure_loaded } from '../../core/lazy_loader.js';

// shared all
import { declare_welcome_mat_panel } from '../../panels/welcome_mat/welcome_mat.js';
import { declare_financial_intro_panel } from '../../panels/intro_graphs/index.js';

// shared gov, dept, crso, program
import {
  declare_results_intro_panel,
  declare_late_dps_warning_panel,
} from '../../panels/intro_graphs/index.js';
import { declare_explore_results_panel } from '../../panels/result_graphs/index.js';
import { declare_budget_measures_panel } from '../../panels/budget_measures/budget_measures_panel.js';

// shared dept, crso, program
import { declare_tags_of_interest_panel } from '../../panels/intro_graphs/index.js';
import { declare_drr_planned_actual_panel } from "../../panels/drr_dp_resources/drr_planned_actual.js";
import { declare_dp_rev_split_panel } from "../../panels/drr_dp_resources/dp_rev_split.js";

// shared dept, program, tag
import { declare_spend_rev_split_panel } from "../../panels/sobj/spend_rev_split.js";

// shared gov, dept
import { declare_links_to_rpb_panel } from '../../panels/intro_graphs/index.js';
import { declare_in_year_voted_stat_split_panel } from "../../panels/vote_stat/in_year_vote_stat_split.js";
//import { declare_in_year_estimates_split_panel } from "../../panels/vote_stat/in_year_estimates_split.js";
import { declare_historical_g_and_c_panel } from "../../panels/transfer_payments/historical_g_and_c.js";
import { declare_auth_exp_prog_spending_panel } from '../../panels/historical_auth_exp/auth_exp_prog_spending.js';

// shared dept, program
import { declare_drr_summary_panel } from '../../panels/result_graphs/index.js';

// shared dept, tag
import { declare_detailed_program_spending_split_panel } from "../../panels/detailed_program_spending_split/detailed_program_spending_split.js";

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

// To be safe, ensure all used has_<data> checks are loaded
export const get_dept_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
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
}) );