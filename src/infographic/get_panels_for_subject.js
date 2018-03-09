import '../panels/welcome_mat/welcome_mat.js';

//transfer payments
import "../panels/transfer_payments/last_year_g_and_c_perspective";
import "../panels/transfer_payments/historical_g_and_c";

//ppl panels
import "../panels/people/employee_last_year_totals";
import "../panels/people/employee_totals";
import "../panels/people/employee_type";
import "../panels/people/employee_prov";
import "../panels/people/employee_age";
import "../panels/people/employee_occ_category";
import "../panels/people/employee_executive_level";
import "../panels/people/employee_gender";
import "../panels/people/employee_fol";

//vote-stat
import "../panels/vote-stat/in_year_estimates";
import "../panels/vote-stat/in_year_estimates_split";
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

import "../panels/detailed_program_spending_split/detailed_program_spending_split.js";


import '../panels/historical_auth_exp/historical_auth_exp.js';


//tag-only panels
import '../panels/tag_panels/resource_structure.js'
import '../panels/tag_panels/goco.js';
import '../panels/tag_panels/top_3_dept_graph.js';

//dp/drr stuff but not results
import '../panels/drr_dp_resources/drr_planned_actual.js';
import '../panels/drr_dp_resources/sub_program_resources.js';
import '../panels/drr_dp_resources/planned_prgm_crso_split.js';
import '../panels/drr_dp_resources/crso_program_resources.js';
import '../panels/drr_dp_resources/spending_in_perspective.js';

import { PanelGraph } from '../core/PanelGraph.js';

const get_people_panels = subject => {
  const is_gov = subject.level === "gov";
  return [
    'people_intro',
    "march_snapshot_warning",
    !is_gov && "employee_last_year_totals",
    "employee_totals",
    "employee_prov",
    "employee_type",
    "employee_age",
    //"employee_occ_category",
    //"employee_executive_level",
    //"historical_employee_fol",
    //"employee_gender",
    is_gov && "ppl_open_data_info",
  ];
};

const get_gov_panels = subject => ({
  intro: [
    "simplographic",
  ],
  financial: [
    "financial_intro", 
    "welcome_mat",
    'gocographic',
    "historical_auth_exp",
    "in_year_estimates_split",
    "in_year_voted_stat_split",
    "in_year_stat_breakdown",
    "in_year_voted_breakdown",
    "historical_g_and_c",
    "personnel_spend",
  ],
  people: get_people_panels(subject),
  results: [
    "results_intro",
    "gov_drr",
    "gov_dp",
  ],
  related: [ "gov_related_info" ],
  all_data: ["links_to_rpb" ],
});

const get_dept_panels = subject => {
  return {
    intro: [
      'portfolio_structure_intro',
      'igoc_fields',
      'igoc_links',
    ],
    financial : _.includes(subject.tables,'table6') && [
      "financial_intro", 
      "welcome_mat",
      "in_year_estimates",
      "historical_auth_exp",
      "in_year_estimates_split",
      "in_year_voted_stat_split",
      "spend_by_so_hist",
      "last_year_g_and_c_perspective",
      "historical_g_and_c",
      "spend_rev_split",
      'detailed_program_spending_split',
      'drr_planned_actual',
    ],
    people: _.includes(subject.tables, 'table9') && get_people_panels(subject),
    results: subject.dp_status && [
      "results_intro",
      "drr_summary",
      "explore_results",
    ],
    related: [
      "portfolio_structure_related",
      "related_tags",
    ],
    all_data: _.nonEmpty(subject.tables) && [
      "links_to_rpb",
    ],
  }

};

const get_program_panels = subject => {
  return {
    intro: [
      "dead_program_warning",
      'description',
      'program_fed_structure',
      'program_tags',
    ],
    financial: [
      'dead_program_warning',
      "financial_intro", 
      "welcome_mat",
      'historical_auth_exp',

      'vote_stat_split',
      'spend_rev_split',
      'top_spending_areas',
      "spending_in_tag_perspective",
    
      'drr_planned_actual',
      'sub_program_resources',
    ],
    results: subject.dept.dp_status && !subject.is_internal_service && [
      "results_intro",
      "drr_summary",
      "explore_results",
    ],
    related: [
      "related_program_structure",
      'program_tags',
    ],
  };

};

const get_crso_panels = subject => {

  return {
    intro: [
      "dead_crso_warning",
      'description',
      'crso_in_gov',
      'crso_tags',
    ],
    financial: [
      'dead_crso_warning',
      'financial_intro',
      'welcome_mat',
      
      'crso_by_prog_exp',
      'crso_by_prog_fte',
      'planned_prg_crso_split',
    ],
    results: subject.dept.dp_status && !subject.is_internal_service && [
      "results_intro",
      "explore_results",
    ],
    related: [
      'crso_links_to_other_crso',
      'crso_tags',
    ],
  };

};

const get_tag_panels = subject => {
  return {
    intro: [
      'tagging_key_concepts',
      'description',
      'tag_fed_structure',
      'tag_progs_by_dept',
    ],
    structure: [ 'resource_structure' ],
    financial: [
      'm2m_warning',
      "financial_intro", 
      "welcome_mat",
      'tag_top_3_depts',
      "historical_auth_exp",
      "vote_stat_split",
      'spend_rev_split',
      'top_spending_areas',
      'detailed_program_spending_split',
    ],
    related: [
      'related_tags',
      'sibling_tags',
    ],
  };


}


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

          if(!panel_obj && DEV){
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