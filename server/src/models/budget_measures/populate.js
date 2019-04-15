import _ from "lodash";

import { budget_years } from './budget_measures_common.js';

import { get_standard_csv_file_rows } from '../load_utils.js';

const clean_budget_measure_description = (description) => {
  if ( !_.isNull(description) ){
    const corrected_description_markdown = description
      .replace(/•/g, "\n\n* ")
      .replace(/((\r\n){1}|\r{1}|\n{1})/gm, "\n\n");
  
    return corrected_description_markdown;
  } else {
    return "";
  }
}

export default async function({models}){
  const { FakeBudgetOrgSubject } = models;

  const special_funding_subjects = [
    {
      org_id: "net_adjust",
      level: "special_funding_case",
      name_en: "Net adjustment to be on a 2018-19 Estimates Basis",
      name_fr: "Rajustement net selon le Budget des dépenses de 2018-2019",
      description_en: "",
      description_fr: "",
    },
    {
      org_id: "non_allocated",
      level: "special_funding_case",
      name_en: "Allocation to be determined",
      name_fr: "Affectation à determiner",
      description_en: "",
      description_fr: "",
    },
  ];


  const igoc_rows = get_standard_csv_file_rows(`igoc.csv`);
  const dept_codes_by_org_ids = _.chain(igoc_rows)
    .map( ({org_id, dept_code}) => [org_id, dept_code] )
    .fromPairs()
    .value();

  const get_program_allocations_by_measure_and_org_id = (data) => _.chain(data)
    .filter( ({allocated, withheld}) => allocated || withheld )
    .map(
      ({measure_id, org_id, funding, allocated, withheld, remaining, ...program_columns}) => {
        if ( !_.every(program_columns, _.isNull) ){
          const dept_code = dept_codes_by_org_ids[org_id];
  
          const program_allocations = _.chain(program_columns)
            .thru(
              program_columns => {
                let grouped_columns = {};
                _.each(
                  program_columns,
                  (value, key) => {
                    const column_group = key.replace(/[0-9]+/, '');
                    if ( _.isUndefined(grouped_columns[column_group]) ){
                      grouped_columns[column_group] = [value];
                    } else {
                      grouped_columns[column_group].push(value);
                    }
                  }
                );
                return grouped_columns;
              }
            )
            .values()
            .thru( ([activity_codes, allocation_values]) => {
              const actual_activity_codes = _.compact(activity_codes);

              const has_more_allocation_values_than_activity_codes = !_.chain(allocation_values)
                .drop(actual_activity_codes.length)
                .compact()
                .isEmpty()
                .value();

              if (has_more_allocation_values_than_activity_codes){
                throw `Budget data error: the row for measure ${measure_id} and org ${org_id} has a missmatched number of activity codes and program allocation values`;
              }

              return _.zip( actual_activity_codes, _.take(allocation_values, actual_activity_codes.length) );
            })
            .fromPairs()
            .mapKeys( (allocation_value, activity_code) => `${dept_code}-${activity_code}`)
            .value();
  
          return [measure_id, {[org_id]: program_allocations}];
        }
      }
    )
    .compact()
    .groupBy( ([measure_id]) => measure_id )
    .mapValues(
      (rows) => _.chain(rows)
        .map( ([measure_id, program_allocations_by_org_id]) => program_allocations_by_org_id )
        .reduce(
          (program_allocations_by_org_ids, program_allocations_by_org_id) => ({
            ...program_allocations_by_org_ids,
            ...program_allocations_by_org_id,
          }),
          {},
        )
        .value()
    )
    .value();
  
  const program_allocations_by_measure_and_org_id_to_model = (program_allocations_by_measure_and_org_id) => _.flatMap(
    program_allocations_by_measure_and_org_id,
    (program_allocations_by_org_id, measure_id) => _.flatMap(
      program_allocations_by_org_id,
      (program_allocations, org_id) => _.flatMap(
        program_allocations,
        (allocated, subject_id) => ({
          unique_id: `${measure_id}-${org_id}-${subject_id}`,

          subject_id,
          org_id,
          measure_id,
      
          allocated,
        })
      )
    )
  );
  
  return await Promise.all([
    FakeBudgetOrgSubject.insertMany(special_funding_subjects),
    ..._.flatMap( budget_years, async (budget_year) => {
      const budget_data = get_standard_csv_file_rows(`budget_${budget_year}_measure_data.csv`);
      const budget_lookups = get_standard_csv_file_rows(`budget_${budget_year}_measure_lookups.csv`);

      const {
        true: measure_lookups,
        false: submeasure_lookups,
      } = _.groupBy(
        budget_lookups,
        ({parent_measure_id}) => _.isNull(parent_measure_id)
      );

      const submeasure_ids = _.map(submeasure_lookups, "measure_id");
      const submeasure_ids_by_parent_measure = _.chain(submeasure_lookups)
        .groupBy("parent_measure_id")
        .mapValues( submeasures => _.map(submeasures, "measure_id") )
        .value();
      
      // In the csv, parent measures do NOT contain the allocated, withheld, and program allocation values of their submeasures (I gather
      // that's done so, in the open data set, people summing by columns readily see the correct totals). That means, before loading the csv data
      // in to the database, we have to go around rolling up the submeasure values in to their parents.
      // Because we do that here, in the final model, submeasures don't have values that contribute to the total; they just represent granular breakouts of 
      // certain real measures.
      const {
        true: measure_data,
        false: submeasure_data,
      } = _.chain(budget_data)
        .map( 
          ({measure_id, org_id, funding, allocated, withheld, remaining, ...program_columns}) => ({
            measure_id, 
            org_id, 
            funding: +funding, 
            allocated: +allocated,
            withheld: +withheld,
            remaining: +remaining,
            ..._.mapValues(
              program_columns,
              (allocation_value_or_activity_code) => /[A-Z]/.test(allocation_value_or_activity_code) ?
                allocation_value_or_activity_code :
                +allocation_value_or_activity_code
            ),
          })
        )
        .groupBy( ({measure_id}) => !_.includes(submeasure_ids, measure_id) )
        .value();
    
      const submeasure_ids_by_parent_measure_and_org_id = _.mapValues(
        submeasure_ids_by_parent_measure,
        (submeasure_ids) => _.chain(submeasure_data)
          .filter( ({measure_id}) => _.includes(submeasure_ids, measure_id) )
          .groupBy("org_id")
          .mapValues( submeasures => _.map(submeasures, "measure_id") )
          .value()
      );

      const direct_program_allocations_by_measure_and_org_id = get_program_allocations_by_measure_and_org_id(measure_data);
      const submeasure_program_allocations_by_submeasure_and_org_id = get_program_allocations_by_measure_and_org_id(submeasure_data);

      const program_allocations_by_measure_and_org_id = _.chain(measure_data)
        .groupBy("measure_id")
        .mapValues(
          (rows_for_measure_id, measure_id) => _.chain(rows_for_measure_id)
            .groupBy("org_id")
            .mapValues(
              (measure_data, org_id) => {
                const direct_program_allocations = _.get(
                  direct_program_allocations_by_measure_and_org_id,
                  `${measure_id}.${org_id}`
                );

                const submeasure_ids = _.get(
                  submeasure_ids_by_parent_measure_and_org_id, 
                  `${measure_id}.${org_id}`
                );
                const submeasure_program_allocations = _.map(
                  submeasure_ids, 
                  submeasure_id => _.get(
                    submeasure_program_allocations_by_submeasure_and_org_id, 
                    `${submeasure_id}.${org_id}`
                  )
                );

                if ( !_.isEmpty(direct_program_allocations) && !_.isEmpty(submeasure_program_allocations) ){
                  return _.chain(direct_program_allocations)
                    .cloneDeep()
                    .mergeWith(
                      ...submeasure_program_allocations,
                      (program_allocation_ammount, submeasure_allocation_ammount) => (program_allocation_ammount || 0) + submeasure_allocation_ammount,
                    )
                    .value();
                } else {
                  return {
                    ...direct_program_allocations,
                    ..._.mergeWith(
                      {},
                      ...submeasure_program_allocations,
                      (program_allocation_ammount, submeasure_allocation_ammount) => (program_allocation_ammount || 0) + submeasure_allocation_ammount,
                    ),
                  };
                }
              }
            )
            .value()
        )
        .value();
      
      debugger

      return [
        //models[`Budget${budget_year}Measures`].insertMany([{TODO: "TODO"}]),
        //models[`Budget${budget_year}Data`].insertMany([{TODO: "TODO"}]),
        models[`Budget${budget_year}ProgramAllocations`].insertMany( 
          program_allocations_by_measure_and_org_id_to_model(program_allocations_by_measure_and_org_id)
        ),
        //models[`Budget${budget_year}Submeasures`].insertMany([{TODO: "TODO"}]),
        models[`Budget${budget_year}SubmeasureProgramAllocations`].insertMany( 
          program_allocations_by_measure_and_org_id_to_model(submeasure_program_allocations_by_submeasure_and_org_id)
        ),
      ];
    
      // vvv OLD CODE, but parts of it will still apply to the new data loading process, so keeping around while working vvv
      /* eslint-disable */
      const orgs_funded_by_measure_id = _.chain(budget_data)
        .groupBy("measure_id")
        .mapValues( grouped_fund_rows => _.flatMap(grouped_fund_rows, fund_row => fund_row.org_id) )
        .value();

      const processed_budget_measures = _.chain(budget_measures)
        .clone()
        .each(budget_measures, 
          budget_measure => _.each(budget_measure, 
            (value, key) => key.includes("description") ? budget_measure[key] = clean_budget_measure_description(value) : null
          )
        )
        .value();

      const processed_budget_measures_with_funded_orgs_lists = _.map(processed_budget_measures, 
        budget_measure => _.assign(
          {}, 
          budget_measure, 
          {
            id: budget_measure.measure_id,
            funded_org_ids: orgs_funded_by_measure_id[budget_measure.measure_id],
          }
        )
      );

      _.each( processed_budget_measures_with_funded_orgs_lists, budget_measure => BudgetMeasures.register(budget_measure) );


      const processed_budget_data = _.chain(budget_data)
        .clone()
        .each(
          (budget_fund_row, index) => {
            _.each(budget_fund_row, 
              (value, key) => (key.startsWith("budget_") ? budget_fund_row[key] = +value : null)
            )
          }
        )
        .value();
    }),
  ]);
}