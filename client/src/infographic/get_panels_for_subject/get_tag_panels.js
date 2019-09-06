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
import { declare_horizontal_initiative_profile_panel } from '../../panels/tag_panels/horizontal_initiative_profile.js';
import { declare_resource_structure_panel } from '../../panels/tag_panels/resource_structure.js';


export const get_tag_panels = subject => Promise.all([
  //import('./common_global_panels.js'),
  //import('./common_dept_program_tag_panels.js'),
  //import('./common_dept_tag_panels'),
  //import('./common_program_tag_panels'),
])
  .then(
    (modules) => {
      //const [
      //  {
      //    declare_financial_intro_panel,
      //    declare_welcome_mat_panel,
      //  },
      //  { declare_spend_rev_split_panel },
      //  { declare_detailed_program_spending_split_panel },
      //  {
      //    declare_vote_stat_split_panel,
      //    declare_top_spending_areas_panel,
      //  },
      //] = modules;

      return {
        intro: [
          declare_tagging_key_concepts_panel(),
          declare_description_panel(),
          declare_horizontal_initiative_profile_panel(),
          declare_tag_fed_structure_panel(),
          declare_tag_progs_by_dept_panel(),
        ],
        structure: [ 
          declare_m2m_warning_panel(),
          declare_resource_structure_panel(),
        ],
        //Financial turned off indefinitely
        // financial: [
        //   declare_m2m_warning_panel(),
        //   declare_financial_intro_panel(), 
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
      };
    }
  );