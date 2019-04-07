import _ from "lodash";
import { get_standard_csv_file_rows } from '../load_utils.js';

import { dp_docs } from './results_utils.js';

export default async function({models}){
  const { SubProgram, Result, ResultCount, Indicator, PIDRLink } = models

  
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

    // FAKING OUT 2019 DATA vvv
    //_.each([
    //  "fte_planning_year_1",
    //  "fte_planning_year_2",
    //  "fte_planning_year_3",
    //], key => {
    //  sub_program[key] = +sub_program["fte_pa_last_year"];
    //});
    //_.each([
    //  "spend_planning_year_1",
    //  "spend_planning_year_2",
    //  "spend_planning_year_3",
    //], key => {
    //  sub_program[key] = +sub_program["spend_pa_last_year"];
    //});
    // FAKING OUT 2019 DATA ^^^

    sub_program.sub_program_id = sub_program.id;
    sub_program.id = null;
  });
    
  const faked_dp19_result_records_records = [];
  _.each(result_records, result => {
    result.result_id = result.id;
    result.id = null;

    // FAKING OUT 2019 DATA vvv
    //if (result.doc === "dp18"){
    //  faked_dp19_result_records_records.push({
    //    ...result,
    //    result_id: `${result.result_id}_dp19`,
    //    doc: "dp19",
    //  });
    //} else if (result.doc === "dp19"){
    //  _.chain(result)
    //    .keys()
    //    .each( key => result[key] = null )
    //    .value();
    //}
    // FAKING OUT 2019 DATA ^^^
  });
  
  const faked_dp19_indicator_records = [];
  _.each(indicator_records, indicator => {
    const { 
      target_year, 
      target_month,
      doc,
      stable_id,
    } = indicator;
    
    indicator.indicator_id = indicator.id;
    indicator.id = null;
    indicator.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    indicator.target_month = _.isEmpty(target_month) ? null : +target_month;
    if(!indicator.status_key){
      indicator.status_key = "dp";
    }

    const dp_doc_index = _.indexOf(dp_docs, doc);
    if ( dp_doc_index > 0 ){
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
            previous_year_target_type: previous_year_indicator_instance.target_type,
            previous_year_target_min: previous_year_indicator_instance.target_min,
            previous_year_target_max: previous_year_indicator_instance.target_max,
            previous_year_target_narrative_en: previous_year_indicator_instance.target_narrative_en,
            previous_year_target_narrative_fr: previous_year_indicator_instance.target_narrative_fr,
          }
        )
      }
    }

    // FAKING OUT 2019 DATA vvv
    //if (indicator.doc === "dp18"){
    //  faked_dp19_indicator_records.push({
    //    ...indicator,
    //    result_id: `${indicator.result_id}_dp19`,
    //    indicator_id: `${indicator.indicator_id}_dp19`,
    //    doc: "dp19",
    //  });
    //} else if (indicator.doc === "dp19"){
    //  _.chain(indicator)
    //    .keys()
    //    .each( key => indicator[key] = null )
    //    .value();
    //}
    // FAKING OUT 2019 DATA ^^^
  });
  
  // FAKING OUT 2019 DATA vvv
  const faked_sub_program_records = sub_program_records;
  const faked_result_records = [
    ..._.filter(
      result_records,
      record => _.chain(record).values().some().value()
    ),
    ...faked_dp19_result_records_records,
  ];
  const faked_indicator_records = [
    ..._.filter(
      indicator_records,
      record => _.chain(record).values().some().value()
    ),
    ...faked_dp19_indicator_records,
  ];
  // FAKING OUT 2019 DATA ^^^

  const result_count_records = get_result_count_records(faked_sub_program_records, faked_result_records, faked_indicator_records);

  await SubProgram.insertMany(faked_sub_program_records);
  await Result.insertMany(faked_result_records);
  await ResultCount.insertMany(result_count_records);
  await Indicator.insertMany(faked_indicator_records);
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