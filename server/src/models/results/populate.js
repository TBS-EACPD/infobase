import _ from "lodash";
import { get_standard_csv_file_rows } from '../load_utils.js';

import { dp_docs } from './results_common.js';

export default async function({models}){
  const { SubProgram, Result, ResultCount, Indicator, PIDRLink } = models;
  
  const sub_program_records = get_standard_csv_file_rows("subprograms.csv");

  const result_records = get_standard_csv_file_rows("results.csv");

  const indicator_records = get_standard_csv_file_rows("indicators.csv");

  const pi_dr_links = get_standard_csv_file_rows("pi_dr_links.csv");

  _.each(sub_program_records, sub_program => {
    _.each([
      "spend_planning_year_1",
      "spend_planning_year_2",
      "spend_planning_year_3",
      "fte_planning_year_1",
      "fte_planning_year_2",
      "fte_planning_year_3",
      "spend_pa_last_year",
      "fte_pa_last_year",
      "planned_spend_pa_last_year",
      "planned_fte_pa_last_year",
    ], key => {
      sub_program[key] = _.isNaN(sub_program[key]) ? null : +sub_program[key];
    });

    sub_program.sub_program_id = sub_program.id;
    sub_program.id = null;
  });
    
  _.each(result_records, result => {
    result.result_id = result.id;
    result.id = null;
  });
  
  _.each(indicator_records, indicator => {
    const { 
      target_year, 
      target_month,
      is_reporting_discontinued,
      doc,
      stable_id,
    } = indicator;

    indicator.indicator_id = indicator.id;
    indicator.id = null;
    indicator.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    indicator.target_month = _.isEmpty(target_month) ? null : +target_month;
    indicator.is_reporting_discontinued = is_reporting_discontinued === "1";
    if (!indicator.status_key){
      indicator.status_key = "dp";
    }

    const dp_doc_index = _.indexOf(dp_docs, doc);
    if (dp_doc_index > 0){
      // Look for corresponding indicator, by stable_id, from previous DP. Embed previous year target fields here
      const previous_year_indicator_instance = _.find(
        indicator_records,
        (indicator) => indicator.stable_id === stable_id &&
          indicator.doc === dp_docs[dp_doc_index-1]
      );

      if ( !_.isUndefined(previous_year_indicator_instance) ){
        _.assign(
          indicator,
          {
            ..._.chain(["target_type", "target_min", "target_max", "seeking_to", "target_change"])
              .map(field_key => [ `previous_year_${field_key}`, previous_year_indicator_instance[`${field_key}`] ])
              .fromPairs()
              .value(),
            ..._.chain(["target_narrative", "measure"])
              .flatMap( 
                billingual_field_key => [
                  [
                    `previous_year_${billingual_field_key}_en`,
                    previous_year_indicator_instance[`${billingual_field_key}_en`],
                  ],
                  [
                    `previous_year_${billingual_field_key}_fr`,
                    previous_year_indicator_instance[`${billingual_field_key}_fr`],
                  ],
                ]
              )
              .fromPairs()
              .value(),
          }
        );
      }
    }
  });

  const result_count_records = get_result_count_records(sub_program_records, result_records, indicator_records);

  await SubProgram.insertMany(sub_program_records);
  await Result.insertMany(result_records);
  await ResultCount.insertMany(result_count_records);
  await Indicator.insertMany(indicator_records);
  return await PIDRLink.insertMany(pi_dr_links);
}


const get_result_count_records = (sub_programs, results, indicators) => {
  const sub_program_id_to_program_id = _.chain(sub_programs)
    .map(({sub_program_id, parent_id}) => [sub_program_id, parent_id])
    .fromPairs()
    .thru(
      sub_program_id_to_parent_id => _.mapValues(
        sub_program_id_to_parent_id,
        (parent_id) => sub_program_id_to_parent_id[parent_id] || parent_id
      )
    )
    .value();

  const indicators_by_result_id = _.groupBy(indicators, 'result_id');

  const gov_row = {
    subject_id: 'total',
    level: 'all',
    ...counts_from_indicators(indicators),
  };

  const igoc_rows = get_standard_csv_file_rows("igoc.csv");
  const dept_rows = _.chain(results)
    .groupBy( ({subject_id}) => _.split(sub_program_id_to_program_id[subject_id] || subject_id, '-')[0] )
    .mapValues(
      results => _.flatMap(
        results,
        ({result_id}) => indicators_by_result_id[result_id]
      )
    )
    .map(
      (indicators, dept_code) => ({
        subject_id: _.find(igoc_rows, (igoc_row) => igoc_row.dept_code === dept_code).org_id,
        level: 'dept',
        ...counts_from_indicators(indicators),
      })
    )
    .value();

  const crso_or_prog_rows = _.chain(results)
    .groupBy( ({subject_id}) => sub_program_id_to_program_id[subject_id] || subject_id )
    .mapValues(
      results => _.flatMap(
        results,
        ({result_id}) => indicators_by_result_id[result_id]
      )
    )
    .map(
      (indicators, subject_id) => ({
        subject_id,
        level: 'crso_or_program',
        ...counts_from_indicators(indicators),
      })
    )
    .value();

  return [
    gov_row,
    ...dept_rows,
    ...crso_or_prog_rows,
  ];
};

const counts_from_indicators = (indicators) => _.chain(indicators)
  .map(
    ({doc, result_id, status_key}) => ({
      [`${doc}_results`]: result_id,
      [`${doc}_indicators${ status_key === 'dp' ? '' : `_${status_key}` }`]: 1,
    })
  )
  .thru(
    indicator_count_fragments => {
      const count_keys = _.chain(indicator_count_fragments)
        .flatMap( _.keys )
        .uniq()
        .value();

      return _.chain(indicator_count_fragments)
        .reduce(
          (memo, count_fragment) => {
            _.each(
              count_fragment,
              (value, key) => _.isArray(memo[key]) ? 
                memo[key].push(value) :
                memo[key]++
            );
            return memo;
          },
          _.chain(count_keys)
            .map( key => _.endsWith(key, '_results') ?
              [ key, [] ] :
              [key, 0]
            )
            .fromPairs()
            .value()
        )
        .mapValues( value => _.isArray(value) ? _.uniq(value).length : value )
        .value();
    }
  )
  .value();