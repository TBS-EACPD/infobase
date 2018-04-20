import { createSelector } from 'reselect';

const { text_maker } = require('../models/text.js');
const { infograph_href_template } = require('../link_utils.js');
const { Indicator } = require('../models/results.js');
const { 
  IndicatorDisplay,
} = require('../panels/result_graphs/components.js');
const {
  TextMaker,
} = require('../util_components.js');


export const ResultCounts = ({ base_hierarchy, doc, subject }) => {

  const indicators = _.filter(Indicator.get_flat_indicators(subject), {doc} )

  const indicator_count_obj = { 
    count: indicators.length, 
    type_key: 'indicator',
    type_name: text_maker('indicators'),
  };

  const count_items  = _.chain(base_hierarchy)
    .reject('root')
    .groupBy(node => get_type_header(node) )
    .map( (group, type_name) => ({
      type_name,
      type_key: group[0].data.type,
      count: group.length,
    }))
    .concat([ indicator_count_obj ])
    //.sortBy( ({type_key}) => _.indexOf(sorted_count_header_keys, type_key))
    .map( ({type_key, count}) => [type_key, count] )
    .fromPairs()
    .value();

  let text_key = "";
  if(subject.level === 'dept'){
    if(doc === 'drr16'){
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_drr_dept_sub_sub";
        } else {
          text_key = "result_counts_drr_dept_sub";
        }
      } else {
        text_key = "result_counts_drr_dept_no_subs";
      }

    } else {

      if(subject.is_DRF){
        text_key = "result_counts_dp_dept_drf"

      } else {
        if(count_items.sub_program > 0){
          if(count_items.sub_sub_program > 0){
            text_key = "result_counts_dp_dept_paa_sub_sub"
          } else {
            text_key = "result_counts_dp_dept_paa_sub"
          }
        } else {
          text_key = "result_counts_dp_dept_paa_no_subs"
        }
      }
    //dp dept
    }
  //dept
  } else if(subject.level === 'program'){
    if(doc==='drr16'){
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_drr_prog_paa_sub_sub";
        } else {
          text_key = "result_counts_drr_prog_paa_sub";
        }
      } else {
        text_key = "result_counts_drr_prog_paa_no_subs";
      }
    } else {
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_dp_prog_paa_sub_sub";
        } else {
          text_key = "result_counts_dp_prog_paa_sub";
        }
      } else {
        text_key = "result_counts_dp_prog_paa_no_subs";
      }
    } 

  } else if(subject.level === 'crso'){
    //we only care about CRs, which are only DP
    text_key = "result_counts_dp_crso_drf";

  }

  return (
    <div className="medium_panel_text">
      <TextMaker 
        text_key={text_key}
        args={{
          subject,

          num_programs:count_items.program,
          num_results:count_items.result,
          num_indicators:count_items.indicator,

          num_subs:count_items.sub_program,
          num_sub_subs:count_items.sub_sub_program,

          num_drs:count_items.dr,
          num_crs:count_items.cr,
        }}

      />
    </div>
  );
}


export const spending_header = createSelector(
  doc => doc, 
  doc => (
    <TextMaker 
      text_key={
        doc === 'dp17' ?
        "tag_nav_exp_header_dp17" :
        'tag_nav_exp_header_drr16' 
      }
    />
  )
);

export const fte_header = createSelector(
  doc => doc,
  doc => (
    <TextMaker 
      text_key={
        doc === 'dp17' ?
        "tag_nav_fte_header_dp17" :
        'tag_nav_fte_header_drr16' 
      }
    />
  )
);

export const get_type_header = node => {
  switch(node.data.type){
    case 'dept': 
      return text_maker('orgs');

    case 'cr': 
      return text_maker("core_responsibilities");

    case 'so': 
      return text_maker("strategic_outcomes");

    case 'program': 
      return text_maker('programs');

    case 'sub_program':
      return text_maker('sub_programs');

    case 'sub_sub_program': 
      return text_maker('sub_sub_programs');

    case 'dr':
      return text_maker("dept_results");

    case 'result':
      return text_maker("results");

    default:
      return null;
  }
};

export const ResultNodeContent = ({ 
  node: {
    data: {
      result, 
      contributing_programs, 
      result_subject, 
      indicators, 
    },
    children : indicator_nodes,
  },
  doc,
}) => (
  <div className="indicator-container-container">
    <div className="indicator-container">
      <IndicatorDisplay indicators={_.map(indicator_nodes, 'data.indicator')} stripe_rows={true} />
    </div>
    { !_.isEmpty(contributing_programs) && 
      <div>
        <header className="agnostic-header"> <TextMaker text_key="programs_tagged_as_dr_contributors" /> </header>
        <ul>                
          {_.map(contributing_programs, prog => 
            <li key={prog.id}>
              <a href={infograph_href_template(prog)}> { prog.name } </a>
            </li>
          )}
        </ul>
      </div>
    }
  </div>
);