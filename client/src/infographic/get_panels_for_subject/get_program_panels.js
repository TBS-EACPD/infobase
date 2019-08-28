import { ensure_loaded } from '../../core/lazy_loader.js';

// shared all
import '../../panels/welcome_mat/welcome_mat.js';
import '../../panels/intro_graphs/intro_graphs.js';

// shared gov, dept, crso, program
import '../../panels/result_graphs/result_graphs.js';
import '../../panels/budget_measures/budget_measures_panel.js';

// shared dept, crso, program, tag
import '../../panels/tag_panels/resource_structure.js';

// shared dept, program, crso
import "../../panels/drr_dp_resources/drr_planned_actual.js";
import "../../panels/drr_dp_resources/dp_rev_split.js";

// shared dept, program, tag
import "../../panels/sobj/spend_rev_split.js";

// shared program, tag
import "../../panels/vote-stat/last_year_vote_stat_split.js";
import "../../panels/sobj/top_spending_areas.js";

// program only panels
import "../../panels/drr_dp_resources/sub_program_resources.js";
import "../../panels/drr_dp_resources/spending_in_perspective.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_program_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    "dead_program_warning",
    'profile',
    'program_fed_structure',
  ],
  financial: [
    'dead_program_warning',
    "financial_intro",
    "welcome_mat",
    "budget_measures_panel",
    'vote_stat_split',
    'spend_rev_split',
    'top_spending_areas',
    "spending_in_tag_perspective",
    'drr_planned_actual',
    'sub_program_resources',
    "dp_rev_split",
  ],
  results: !subject.is_internal_service && subject.has_data('results_data') && [
    "results_intro",
    'late_dps_warning',
    "drr_summary",
    "explore_results",
  ],
  related: [
    "related_program_structure",
    'tags_of_interest',
  ],
}) );