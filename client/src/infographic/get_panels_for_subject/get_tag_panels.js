// shared all
import '../../panels/welcome_mat/welcome_mat.js';
import '../../panels/intro_graphs/intro_graphs.js';

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
import '../../panels/tag_panels/horizontal_initiative_profile.js';
//import '../../panels/tag_panels/top_3_dept_graph.js';

export const get_tag_panels = subject => ({
  intro: [
    'tagging_key_concepts',
    'description',
    'horizontal_initiative_profile',
    'tag_fed_structure',
    'tag_progs_by_dept',
  ],
  structure: [ 
    'm2m_warning',
    'resource_structure',
  ],
  //Financial turned off indefinitely
  // financial: [
  //   'm2m_warning',
  //   "financial_intro", 
  //   "welcome_mat",
  //   'tag_top_3_depts',
  //   "vote_stat_split",
  //   'spend_rev_split',
  //   'top_spending_areas',
  //   'detailed_program_spending_split',
  // ],
  related: [
    'related_tags',
    'sibling_tags',
  ],
});