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

// crso only panels
import "../../panels/drr_dp_resources/crso_by_prog.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_crso_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    "dead_crso_warning",
    'profile',
    'crso_in_gov',
  ],
  financial: [
    'dead_crso_warning',
    'financial_intro',
    'welcome_mat',
    'budget_measures_panel',
    'drr_planned_actual',
    'crso_by_prog_exp',
    'crso_by_prog_fte',
    "dp_rev_split",
  ],
  results: !subject.is_internal_service && subject.has_data('results_data') && [
    "results_intro",
    'late_dps_warning',
    "explore_results",
  ],
  related: [
    'crso_links_to_other_crso',
    'tags_of_interest',
  ],
}) );