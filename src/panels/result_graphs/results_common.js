const {
  text_maker,
} = require("../shared"); 

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

const drr_and_dp_cols = [
  "{{pa_last_year}}",
  "{{planning_year_1}}",
  "{{planning_year_2}}",
  "{{planning_year_3}}",
];

//TODO: can we get rid of this variable?
const planned_cols = [ 
  "{{planning_year_1}}",
  "{{planning_year_2}}",
  "{{planning_year_3}}",
];


const get_rows_for_subject_from_table = _.memoize((subject,table) => {
  let rows = [];
  if( subject.level === 'program'){
    const rows_or_record = table.programs.get(subject);
    if(_.isArray(rows_or_record)){ 
      rows = rows_or_record
    } else {
      rows = [ rows_or_record ];
    }
  } else if(!_.isEmpty(subject.programs)){
    rows = _.chain(subject.programs)
      .map(prog => get_rows_for_subject_from_table(prog,table) )
      .flatten()
      .value()
  } else if(subject.level === 'ministry'){
    rows = _.chain(subject.orgs)
      .map(org => get_rows_for_subject_from_table(org, table) )
      .flatten(true)
      .compact()
      .value();
  } else if(!_.isEmpty(subject.children_tags)){
    rows = _.chain(subject.children_tags)
      .map(tag => get_rows_for_subject_from_table(tag, table) )
      .flatten(true)
      .uniqBy()
      .compact()
      .value();
  }
  return rows;

}, (subject,table) => `${subject.guid}-${table.id}` );

const get_planning_data_for_subject_from_table = (subject,table) => {
  const rows = get_rows_for_subject_from_table(subject,table);
  return _.chain(rows)
    .compact()
    .pipe( rows => _.chain(drr_and_dp_cols)
      .map(col_nick => [
        col_nick, 
        table.col_from_nick(
          table.id === 'table6' && col_nick === "{{pa_last_year}}" ? 
          "{{pa_last_year}}exp" : 
          col_nick
        ).formula(rows),
      ])
      .fromPairs()
      .value()
    )
    .value();
};

const planned_resource_fragment = ({ table6, table12, subject}) => {
  const spending = get_planning_data_for_subject_from_table(subject, table6);
  const ftes =  get_planning_data_for_subject_from_table(subject, table12);

  const flat_data = _.map(
    drr_and_dp_cols,
    col_nick => ({
      year: col_nick,
      spending: (
        _.isUndefined(spending[col_nick]) ? 
        text_maker('unknown') : 
        spending[col_nick] 
      ),
      ftes: (
        _.isUndefined(ftes[col_nick]) ? 
        text_maker('unknown') : 
        ftes[col_nick] 
      ),
    })
  );
  return flat_data; 

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
  planned_cols,
  isBadDeptWithoutResults,
  row_to_drr_status_counts,
  result_statuses,
  
}
