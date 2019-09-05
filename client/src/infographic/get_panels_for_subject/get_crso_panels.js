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

// shared crso, program
import { declare_profile_panel } from '../../panels/intro_graphs/index.js';

// crso only panels
import {
  declare_dead_crso_warning_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,
} from '../../panels/intro_graphs/index.js';
import {
  declare_crso_by_prog_fte_panel,
  declare_crso_by_prog_exp_panel,
} from "../../panels/drr_dp_resources/crso_by_prog.js";

// To be safe, ensure all used has_<data> checks are loaded
export const get_crso_panels = subject => ensure_loaded({
  subject: subject,
  has_results: true,
}).then( () => ({
  intro: [
    declare_dead_crso_warning_panel(),
    declare_profile_panel(),
    declare_crso_in_gov_panel(),
  ],
  financial: [
    declare_dead_crso_warning_panel(),
    declare_financial_intro_panel(),
    declare_welcome_mat_panel(),
    declare_budget_measures_panel(),
    declare_drr_planned_actual_panel(),
    declare_crso_by_prog_fte_panel(),
    declare_crso_by_prog_exp_panel(),
    declare_dp_rev_split_panel(),
  ],
  results: !subject.is_internal_service && subject.has_data('results_data') && [
    declare_results_intro_panel(),
    declare_late_dps_warning_panel(),
    declare_explore_results_panel(),
  ],
  related: [
    declare_crso_links_to_other_crso_panel(),
    declare_tags_of_interest_panel(),
  ],
}) );