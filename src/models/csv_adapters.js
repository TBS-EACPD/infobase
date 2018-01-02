//These functions are just for converting csv to a simple obj, ready to be used by model class
//we  provide the reverse (obj to csv) when node is in the business of modifying and mocking data

//TODO: add column for spend_drr_planning_year_1, actual_spend_drr_planning_year_1

function sub_program(csv_row){
  const [
    id,
    parentID,
    name,
    description,
    spend_planning_year_1,
    spend_planning_year_2,
    spend_planning_year_3, 
    fte_planning_year_1, 
    fte_planning_year_2, 
    fte_planning_year_3,
    dp_no_spending_expl,
    dp_spend_trend_expl,
    dp_no_fte_expl,
    dp_fte_trend_expl,

    planned_spend_pa_last_year,
    spend_pa_last_year,
    drr_spend_expl,

    planned_fte_pa_last_year,
    fte_pa_last_year,
    drr_fte_expl,
  ] = csv_row;

  return {
    id,
    parentID,
    name,
    description,
    spend_planning_year_1: _.isNaN(+spend_planning_year_1) ? null : +spend_planning_year_1,
    spend_planning_year_2: _.isNaN(+spend_planning_year_2) ? null : +spend_planning_year_2,
    spend_planning_year_3: _.isNaN(+spend_planning_year_3) ? null : +spend_planning_year_3,
    fte_planning_year_1: _.isNaN(+fte_planning_year_1) ? null : +fte_planning_year_1, 
    fte_planning_year_2:  _.isNaN(+fte_planning_year_2)? null : +fte_planning_year_2, 
    fte_planning_year_3:  _.isNaN(+fte_planning_year_3)? null : +fte_planning_year_3, 

    dp_no_spending_expl,
    dp_spend_trend_expl,
    dp_no_fte_expl,
    dp_fte_trend_expl,

    spend_pa_last_year : _.isNaN(+spend_pa_last_year)? null : +spend_pa_last_year, 
    fte_pa_last_year : _.isNaN(+fte_pa_last_year)? null : +fte_pa_last_year, 
    planned_spend_pa_last_year : _.isNaN(+planned_spend_pa_last_year)? null : +planned_spend_pa_last_year, 
    planned_fte_pa_last_year : _.isNaN(+planned_fte_pa_last_year)? null : +planned_fte_pa_last_year, 

    drr_spend_expl,
    drr_fte_expl,
  };

}

function sub_program_to_row(obj){
  const {
    id,
    parentID,
    name,
    description,
    spend_planning_year_1,
    spend_planning_year_2,
    spend_planning_year_3,
    fte_planning_year_1,
    fte_planning_year_2,
    fte_planning_year_3,

    dp_no_spending_expl,
    dp_spend_trend_expl,
    dp_no_fte_expl,
    dp_fte_trend_expl,
    spend_pa_last_year,
    fte_pa_last_year,
    planned_spend_pa_last_year,
    planned_fte_pa_last_year,
    drr_spend_expl,
    drr_fte_expl,
  } = obj;

  return [
    id,
    parentID,
    name,
    description,
    spend_planning_year_1,
    spend_planning_year_2,
    spend_planning_year_3, 
    fte_planning_year_1, 
    fte_planning_year_2, 
    fte_planning_year_3,
    dp_no_spending_expl,
    dp_spend_trend_expl,
    dp_no_fte_expl,
    dp_fte_trend_expl,

    planned_spend_pa_last_year,
    spend_pa_last_year,
    drr_spend_expl,

    planned_fte_pa_last_year,
    fte_pa_last_year,
    drr_fte_expl,
  ];
}

//TODO: add field for DP vs DRR ?
function result(csv_row){
  const [ id, subject_id, name, is_efficiency, doc ] = csv_row;

  return {
    id,
    subject_id,
    name,
    is_efficiency: is_efficiency === "1",
    doc,
  };
}

function result_to_row(obj){
  const { 
    id, 
    subject_id, 
    name, 
    is_efficiency, 
    doc, 
  } = obj;

  return [
    id,
    subject_id,
    name,
    is_efficiency ? "1" : "",
    doc,
  ];
}

function indicator(row){

  const [
    id,
    result_id,
    name,
    target_year,
    target_month,
    explanation, //"ExpResultsorTarget_EN",
    target_type,
    min,
    max,
    planned_target_str,
    doc,
    actual_datatype,
    actual_target_str,
    status_color_code,
    status_period_code,
  ] = row;

  const status_color= status_color_code; //status_colors[status_color_code];
  const status_period= status_period_code; //status_periods[status_period_code];
  const status_key = status_color && status_period && `${status_period}_${status_color}`;

  return {
    id,
    result_id,
    name,
    target_year: _.isNaN(parseInt(target_year)) ? target_year : parseInt(target_year),
    target_month: _.isEmpty(target_month) ? null : +target_month,
    explanation,
    target_type,
    min,
    max,
    planned_target_str,
    doc,
    actual_target_str,
    actual_datatype,
    status_color,
    status_period,
    status_key,
  }
}

/* eslint-disable no-unused-vars */
const status_periods = {
  a: 'past',
  b: 'future', 
  c: 'other',
};

/* eslint-disable no-unused-vars */
const status_colors = {
  a: 'success',
  b: 'failure',
  c:'not_appl',
  d:'not_avail',
};

/* eslint-disable no-unused-vars */
const rev_status_colors = _.chain(status_colors)
  .map( (val,key) => [val,key] )
  .fromPairs()
  .value();

/* eslint-disable no-unused-vars */
const rev_status_periods = _.chain(status_periods)
  .map( (val,key) => [val,key] )
  .fromPairs()
  .value();

function indicator_to_row(obj){
  const {
    id,
    result_id,
    name,
    target_year,
    target_month,
    explanation,
    target_type,
    min,
    max,
    planned_target_str,
    doc,
    actual_datatype,
    actual_target_str,
    status_color,
    status_period,
  } = obj;

  return [
    id,
    result_id,
    name,
    target_year,
    target_month,
    explanation, //"ExpResultsorTarget_EN",
    target_type,
    min,
    max,
    planned_target_str,
    doc,
    actual_datatype,
    actual_target_str,
    status_color,
    status_period,
  ];

}



function footnote(row){
  const [id, level_name, subject_id, year1, year2, topic_keys,footnote] = row

  return {
    id,
    level_name,
    subject_id,
    year1,
    year2,
    topic_keys,
    footnote,
  };

}

const footnote_to_row = ({
  id,
  level_name,
  subject_id,
  year1,
  year2,
  topic_keys,
  footnote,
}) => [
  id,
  level_name,
  subject_id,
  year1,
  year2,
  topic_keys,
  footnote,
];


module.exports = exports = {
  sub_program,
  sub_program_to_row,

  result,
  result_to_row,

  indicator,
  indicator_to_row,

  footnote_to_row,
  footnote,
}
