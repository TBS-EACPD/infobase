const _ = require('lodash');

function sub_program_csv_adapter(csv_row){
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


function result(csv_row){
  const [ id, subject_id, name, doc ] = csv_row;

  return {
    id,
    subject_id,
    name,
    doc,
  };
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

module.exports = exports = {
  sub_program_csv_adapter,
  result_csv_adapter: result,
  indicator_csv_adapter: indicator,
}