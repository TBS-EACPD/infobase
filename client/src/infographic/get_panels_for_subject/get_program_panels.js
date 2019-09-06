import { ensure_loaded } from '../../core/lazy_loader.js';

// shared all
import { declare_welcome_mat_panel } from '../../panels/welcome_mat/welcome_mat.js';
import { declare_financial_intro_panel } from '../../panels/intro_graphs/index.js';

// shared gov, dept, crso, program
import {
  declare_results_intro_panel,
  declare_late_dps_warning_panel,
} from '../../panels/intro_graphs/index.js';
import { declare_budget_measures_panel } from '../../panels/budget_measures/budget_measures_panel.js';

// shared dept, crso, program
import { declare_explore_results_panel } from '../../panels/result_graphs/index.js';
import { declare_tags_of_interest_panel } from '../../panels/intro_graphs/index.js';
import { declare_drr_planned_actual_panel } from "../../panels/drr_dp_resources/drr_planned_actual.js";
import { declare_dp_rev_split_panel } from "../../panels/drr_dp_resources/dp_rev_split.js";

// shared dept, program, tag
import { declare_spend_rev_split_panel } from "../../panels/sobj/spend_rev_split.js";

// shared dept, program
import { declare_drr_summary_panel } from '../../panels/result_graphs/index.js';

// shared crso, program
import { declare_profile_panel } from '../../panels/intro_graphs/index.js';

// shared program, tag
import { declare_vote_stat_split_panel } from "../../panels/vote_stat/last_year_vote_stat_split.js";
import { declare_top_spending_areas_panel } from "../../panels/sobj/top_spending_areas.js";

// program only panels
import {
  declare_dead_program_warning_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
} from '../../panels/intro_graphs/index.js';
import { declare_spending_in_tag_perspective_panel } from "../../panels/drr_dp_resources/spending_in_perspective.js";
import { declare_sub_program_resources_panel } from "../../panels/drr_dp_resources/sub_program_resources.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_program_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    declare_dead_program_warning_panel(),
    declare_profile_panel(),
    declare_program_fed_structure_panel(),
  ],
  financial: [
    declare_dead_program_warning_panel(),
    declare_financial_intro_panel(),
    declare_welcome_mat_panel(),
    declare_budget_measures_panel(),
    declare_vote_stat_split_panel(),
    declare_spend_rev_split_panel(),
    declare_top_spending_areas_panel(),
    declare_spending_in_tag_perspective_panel(),
    declare_drr_planned_actual_panel(),
    declare_sub_program_resources_panel(),
    declare_dp_rev_split_panel(),
  ],
  results: !subject.is_internal_service && subject.has_data('results_data') && [
    declare_results_intro_panel(),
    declare_late_dps_warning_panel(),
    declare_drr_summary_panel(),
    declare_explore_results_panel(),
  ],
  related: [
    declare_related_program_structure_panel(),
    declare_tags_of_interest_panel(),
  ],
}) );