import _ from "lodash";
import { get_standard_csv_file_rows } from '../load_utils.js';

export default async function({models}){
  const { SubProgram, Result, ResultCount, Indicator, PIDRLink } = models

  const sub_program_records = get_standard_csv_file_rows("subprograms.csv");

  const result_records = get_standard_csv_file_rows("results.csv");

  const indicator_records = get_standard_csv_file_rows("indicators.csv");

  const pi_dr_links = get_standard_csv_file_rows("pi_dr_links.csv");
  

  _.each(sub_program_records, obj => {
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
      obj[key] = _.isNaN(obj[key]) ? null : +obj[key];
    });
    obj.sub_program_id = obj.id;
    obj.id = null;
  });
    
  _.each(result_records, obj => {
    obj.result_id = obj.id;
    obj.id = null;
  });
  
  _.each(indicator_records, obj => {
    const { 
      target_year, 
      target_month,
    } = obj;

    obj.indicator_id = obj.id;
    obj.id = null;
    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month= _.isEmpty(target_month) ? null : +target_month;
    if(!obj.status_key){
      obj.status_key = "dp";
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