import '../panels/welcome_mat/welcome_mat.js';


import '../panels/intro_graphs/intro_graphs.js';
import '../panels/result_graphs/result_graphs.js';
import '../panels/igoc/igoc_panel.js';

//transfer payments
import "../panels/transfer_payments/last_year_g_and_c_perspective";
import "../panels/transfer_payments/historical_g_and_c";

//ppl panels
import "../panels/people/employee_last_year_totals";
import "../panels/people/employee_totals";
import "../panels/people/employee_type";
import "../panels/people/employee_prov";
import "../panels/people/employee_age";
import "../panels/people/employee_executive_level";
import "../panels/people/employee_gender";
import "../panels/people/employee_fol";

//vote-stat
import "../panels/vote-stat/in_year_estimates";
//turned off until supps A
//import "../panels/vote-stat/in_year_estimates_split";
import "../panels/vote-stat/in_year_vote_stat_split";
import "../panels/vote-stat/in_year_vote-stat_breakdown";
import "../panels/vote-stat/last_year_vote_stat_split";

//standard object
import "../panels/sobj/spend_rev_split";
import "../panels/sobj/top_spending_areas";
import "../panels/sobj/spend_by_so_hist";
import "../panels/sobj/top_spending_areas.js";
import "../panels/sobj/personel_spend.js";
import "../panels/sobj/spend_rev_split.js";

//FIXME: currently turned off in infographic, it's here for access in graph-inventory
import '../panels/internal_services/isc.js';


import "../panels/detailed_program_spending_split/detailed_program_spending_split.js";

import '../panels/historical_auth_exp/auth_exp_prog_spending.js';

//tag-only panels
import '../panels/tag_panels/resource_structure.js';
import '../panels/tag_panels/goco.js';
import '../panels/tag_panels/horizontal_initiative_profile.js';
// import '../panels/tag_panels/top_3_dept_graph.js';

//dp/drr stuff but not results
import '../panels/drr_dp_resources/drr_planned_actual.js';
import '../panels/drr_dp_resources/sub_program_resources.js';
import '../panels/drr_dp_resources/crso_by_prog.js';
import '../panels/drr_dp_resources/spending_in_perspective.js';
import '../panels/drr_dp_resources/dp_rev_split.js';

import '../panels/budget_measures/budget_measures_panel.js';

import { PanelGraph } from '../core/PanelGraph.js';

const get_people_panels = subject => {
  const is_gov = subject.level === "gov";
  return [
    'people_intro',
    !is_gov && "employee_last_year_totals",
    "employee_totals",
    "employee_prov",
    "employee_type",
    "employee_age",
    "employee_executive_level",
    "employee_fol",
    "employee_gender",
  ];
};

const get_gov_panels = subject => ({
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

const get_dept_panels = subject => ({
  intro: [
    'igoc_fields',
    'portfolio_structure_intro',
    'igoc_links',
  ],
  financial: _.includes(subject.tables, 'programSpending') && [
    "financial_intro",
    "welcome_mat",
    "budget_measures_panel",
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
});

const get_program_panels = subject => ({
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
});

const get_crso_panels = subject => ({
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
});

const get_tag_panels = subject => ({
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


export function get_panels_for_subject(subject){
  let panel_keys;
  switch(subject.level){
    case 'gov':
      panel_keys = get_gov_panels(subject);
      break;
    case 'dept':
      panel_keys = get_dept_panels(subject);
      break;
    case 'crso':
      panel_keys = get_crso_panels(subject);
      break;
    case 'tag':
      panel_keys = get_tag_panels(subject);
      break;
    case 'program':
      panel_keys = get_program_panels(subject);
      break;
  }

  return _.chain(panel_keys)
    .map( (panel_keys_for_area, area_id)=> [
      area_id,
      _.chain(panel_keys_for_area)
        .compact() //the above functions create null elements to ease using conditionals, filter them out.
        .map(key => {
          const panel_obj = PanelGraph.lookup(key, subject.level);

          if(!panel_obj && window.is_dev){
            throw `${key} is not a valid graph`;
          }

          return panel_obj && key;
        })
        .value(),
    ])
    .fromPairs()
    .pickBy(_.nonEmpty) //filter out empty bubbles 
    .value();
}