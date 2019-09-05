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

// shared dept, crso, program, tag
import '../../panels/tag_panels/resource_structure.js';

// shared dept, program, crso
import { declare_tags_of_interest_panel } from '../../panels/intro_graphs/index.js';
import "../../panels/drr_dp_resources/drr_planned_actual.js";
import "../../panels/drr_dp_resources/dp_rev_split.js";

// shared dept, program, tag
import "../../panels/sobj/spend_rev_split.js";

// shared gov, dept
import { declare_links_to_rpb_panel } from '../../panels/intro_graphs/index.js';
import "../../panels/transfer_payments/historical_g_and_c.js";
import "../../panels/vote-stat/in_year_estimates.js";
import "../../panels/vote-stat/in_year_vote_stat_split.js";
import '../../panels/historical_auth_exp/auth_exp_prog_spending.js';

// shared dept, program
import { declare_drr_summary_panel } from '../../panels/result_graphs/index.js';

// shared dept, tag
import "../../panels/detailed_program_spending_split/detailed_program_spending_split.js";

// dept only panels
import {
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
} from '../../panels/intro_graphs/index.js';
import '../../panels/igoc/igoc_panel.js';
import "../../panels/transfer_payments/last_year_g_and_c_perspective.js";
import "../../panels/sobj/spend_by_so_hist.js";
//import '../../panels/internal_services/isc.js';

// To be safe, ensure all used has_<data> checks are loaded
export const get_dept_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    'igoc_fields',
    declare_portfolio_structure_intro_panel(),
  ],
  financial: _.includes(subject.tables, 'programSpending') && [
    declare_financial_intro_panel(),
    declare_welcome_mat_panel(),
    declare_budget_measures_panel(),
    "auth_exp_prog_spending",
    "estimates_in_perspective",
    //"in_year_estimates_split",//turned off until supps A
    "in_year_voted_stat_split",
    "spend_by_so_hist",
    "last_year_g_and_c_perspective",
    "historical_g_and_c",
    "spend_rev_split",
    'detailed_program_spending_split',
    'drr_planned_actual',
    "dp_rev_split",
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