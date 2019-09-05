// shared all
//import { declare_welcome_mat_panel } from '../../panels/welcome_mat/welcome_mat.js';
//import { declare_financial_intro_panel } from '../../panels/intro_graphs/index.js';

// shared dept, crso, program, tag
import '../../panels/tag_panels/resource_structure.js';

// shared dept, program, tag
//import "../../panels/sobj/spend_rev_split.js";

// shared dept, tag
//import "../../panels/detailed_program_spending_split/detailed_program_spending_split.js";
//import "../../panels/sobj/top_spending_areas.js";

// shared program, tag
//import "../../panels/vote-stat/last_year_vote_stat_split.js";

// tag only panels
import {
  declare_m2m_warning_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,
  declare_description_panel,
  declare_tagging_key_concepts_panel,
} from '../../panels/intro_graphs/index.js';
import '../../panels/tag_panels/horizontal_initiative_profile.js';
//import '../../panels/tag_panels/top_3_dept_graph.js';

export const get_tag_panels = subject => ({
  intro: [
    declare_tagging_key_concepts_panel(),
    declare_description_panel(),
    'horizontal_initiative_profile',
    declare_tag_fed_structure_panel(),
    declare_tag_progs_by_dept_panel(),
  ],
  structure: [ 
    declare_m2m_warning_panel(),
    'resource_structure',
  ],
  //Financial turned off indefinitely
  // financial: [
  //   declare_m2m_warning_panel(),
  //   declare_financial_intro_panel(), 
  //   declare_welcome_mat_panel(),
  //   'tag_top_3_depts',
  //   "vote_stat_split",
  //   'spend_rev_split',
  //   'top_spending_areas',
  //   'detailed_program_spending_split',
  // ],
  related: [
    declare_related_tags_panel(),
    declare_sibling_tags_panel(),
  ],
});