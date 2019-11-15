import {
  // shared all
  //declare_welcome_mat_panel,
  //declare_financial_key_concepts_panel,
  
  // shared dept, program, tag
  //declare_spend_rev_split_panel,
  
  // shared dept, tag
  //declare_detailed_program_spending_split_panel,
  
  // shared program, tag
  //declare_vote_stat_split_panel,
  //declare_top_spending_areas_panel,

  // tag only panels
  declare_m2m_tag_warning_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,
  declare_description_panel,
  declare_tagging_key_concepts_panel,
  declare_horizontal_initiative_profile_panel,
  declare_resource_structure_panel,
} from '../panel_declarations/index.js';

export const get_tag_panels = subject => ({
  intro: [
    declare_tagging_key_concepts_panel(),
    declare_description_panel(),
    declare_horizontal_initiative_profile_panel(),
    declare_tag_fed_structure_panel(),
    declare_tag_progs_by_dept_panel(),
  ],
  structure: [ 
    declare_m2m_tag_warning_panel(),
    declare_resource_structure_panel(),
  ],
  //Financial turned off indefinitely
  // financial: [
  //   declare_m2m_tag_warning_panel(),
  //   declare_financial_key_concepts_panel(), 
  //   declare_welcome_mat_panel(),
  //   declare_vote_stat_split_panel(),
  //   declare_spend_rev_split_panel(),
  //   declare_top_spending_areas_panel(),
  //   declare_detailed_program_spending_split_panel(),
  // ],
  related: [
    declare_related_tags_panel(),
    declare_sibling_tags_panel(),
  ],
});