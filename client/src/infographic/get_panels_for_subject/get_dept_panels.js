import { get_people_panels } from './get_people_panels.js';
import { ensure_loaded } from '../../core/lazy_loader.js';

// shared all
import '../../panels/welcome_mat/welcome_mat.js';
import '../../panels/intro_graphs/intro_graphs.js';

// shared gov, dept, crso, program
import '../../panels/result_graphs/result_graphs.js';
import { declare_budget_measures_panel } from '../../panels/budget_measures/budget_measures_panel.js';

// shared dept, crso, program, tag
import '../../panels/tag_panels/resource_structure.js';

// shared dept, program, crso
import "../../panels/drr_dp_resources/drr_planned_actual.js";
import "../../panels/drr_dp_resources/dp_rev_split.js";

// shared dept, program, tag
import "../../panels/sobj/spend_rev_split.js";

// shared gov, dept
import "../../panels/transfer_payments/historical_g_and_c.js";
import "../../panels/vote-stat/in_year_estimates.js";
import "../../panels/vote-stat/in_year_vote_stat_split.js";
import '../../panels/historical_auth_exp/auth_exp_prog_spending.js';

// shared dept, tag
import "../../panels/detailed_program_spending_split/detailed_program_spending_split.js";

// dept only panels
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
    'portfolio_structure_intro',
  ],
  financial: _.includes(subject.tables, 'programSpending') && [
    "financial_intro",
    "welcome_mat",
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
    "results_intro",
    'late_dps_warning',
    "drr_summary",
    "explore_results",
  ],
  related: _.nonEmpty(subject.programs) && [
    "portfolio_structure_related",
    "tags_of_interest",
  ],
  all_data: _.nonEmpty(subject.tables) && [
    "links_to_rpb",
  ],
}) );