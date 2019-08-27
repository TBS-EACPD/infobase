import { get_people_panels } from './get_people_panels.js';

// shared all
import '../../panels/welcome_mat/welcome_mat.js';
import '../../panels/intro_graphs/intro_graphs.js';

// shared gov, dept, crso, program
import '../../panels/result_graphs/result_graphs.js';
import '../../panels/budget_measures/budget_measures_panel.js';

// shared gov, dept
import "../../panels/transfer_payments/historical_g_and_c.js";
import "../../panels/vote-stat/in_year_estimates.js";
import "../../panels/vote-stat/in_year_vote_stat_split.js";
import '../../panels/historical_auth_exp/auth_exp_prog_spending.js';

// gov only panels
import "../../panels/vote-stat/in_year_vote-stat_breakdown.js";
import "../../panels/sobj/personel_spend.js";
import '../../panels/tag_panels/goco.js';

export const get_gov_panels = subject => ({
  intro: [
    "simplographic",
  ],
  financial: [
    "financial_intro", 
    "welcome_mat",
    "budget_measures_panel",
    "auth_exp_prog_spending",
    //"in_year_estimates_split",//turned off until supps A
    "in_year_voted_stat_split",
    "in_year_stat_breakdown",
    "in_year_voted_breakdown",
    'gocographic',
    "historical_g_and_c",
    "personnel_spend",
  ],
  people: get_people_panels(subject),
  results: [
    "results_intro",
    'late_dps_warning',
    "gov_dp",
    "gov_drr",
  ],
  related: [ "gov_related_info" ],
  all_data: ["links_to_rpb" ],
});