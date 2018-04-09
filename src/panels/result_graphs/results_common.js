const { Table } = require('../../core/TableClass.js');

const {
  Result,
  Indicator,
  SubProgramEntity,
  ResultCounts,
} = require('../../models/results.js');

const { compute_counts_from_set } = require('../../models/result_counts.js');

const { infograph_href_template } = require('../../link_utils.js');
const link_to_results_infograph = subj => infograph_href_template(subj, 'results');

const {result_statuses} = require('../../models/businessConstants.js');

function pick_table(subject,type,doc){
  return Table.lookup(
    type === "spending" ?
    "table6" :
    "table12"
  );
}

const get_rows_for_subject_from_table = _.memoize((subject,type,doc) => {
  const table = pick_table(subject,type,doc);
  if( subject.level === 'program'){
    const rows_or_record = table.programs.get(subject);
    if(!rows_or_record){
      return null;
    }
    if(_.isArray(rows_or_record)){ 
      return rows_or_record
    } else {
      return [ rows_or_record ];
    }
  } else if( doc==="dp17" && _.includes(["dept","crso"], subject.level)){
    return table.q(subject).data;
  }  else if(!_.isEmpty(subject.programs)){
    return _.chain(subject.programs)
      .map(prog => get_rows_for_subject_from_table(prog,type,doc) )
      .flatten()
      .value()
  } else if(subject.level === 'ministry'){
    return _.chain(subject.orgs)
      .map(org => get_rows_for_subject_from_table(org, type,doc) )
      .flatten(true)
      .compact()
      .value();
  } else if(!_.isEmpty(subject.children_tags)){
    return _.chain(subject.children_tags)
      .map(tag => get_rows_for_subject_from_table(tag, type, doc) )
      .flatten(true)
      .uniqBy()
      .compact()
      .value();
  } else {
    return null;
  }

}, (subject,type,doc) => `${subject.guid}-${type}-${doc}` );

const get_planning_data_for_subject_from_table = (subject, type, doc) => {
  const rows = get_rows_for_subject_from_table(subject,type,doc);
  const table = pick_table(subject,type,doc);

  let col;
  if(doc === "drr16"){
    col = "{{pa_last_year}}";
    if(type==="spending"){
      col = "{{pa_last_year}}exp";
    }
  } else {
    col = "{{planning_year_1}}";
  }

  return table.col_from_nick(col).formula(rows);

};

const planned_resource_fragment = (subject, doc) => {
  const spending = get_planning_data_for_subject_from_table(subject, "spending", doc);
  const ftes =  get_planning_data_for_subject_from_table(subject, "fte", doc);

  return {
    spending,
    ftes,
  }; 

};

const isBadDeptWithoutResults = (subject) => _.chain(subject.programs)
  .map(prog => _.isEmpty(Result.get_entity_results(prog.id)) )
  .every()
  .value();



const row_to_drr_status_counts = ({
  drr16_indicators_past_success: past_success,
  drr16_indicators_past_failure: past_failure,
  drr16_indicators_past_not_appl: past_not_appl,
  drr16_indicators_past_not_avail: past_not_avail,

  drr16_indicators_future_success: future_success,
  drr16_indicators_future_failure: future_failure,
  drr16_indicators_future_not_appl: future_not_appl,
  drr16_indicators_future_not_avail: future_not_avail,

}) => ({
  past_success,
  past_failure,
  past_not_avail,
  past_not_appl,

  future_success,
  future_failure,
  future_not_avail,
  future_not_appl,

});


module.exports = exports = {
  Result,
  Indicator,
  SubProgramEntity,
  ResultCounts,

  compute_counts_from_set,

  planned_resource_fragment,
  link_to_results_infograph,
  isBadDeptWithoutResults,
  row_to_drr_status_counts,
  result_statuses,
  
}
