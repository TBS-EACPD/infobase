import _ from "lodash";

import { budget_years } from './budget_measures_common.js';

import { get_standard_csv_file_rows } from '../load_utils.js';

export default async function({models}){
  const { FakeBudgetOrgSubject } = models;

  const clean_budget_measure_description = (description) => {
    if ( !_.isNull(description) ){
      const corrected_description_markdown = description
        .replace(/•/g, "\n\n* ")
        .replace(/((\r\n){1}|\r{1}|\n{1})/gm, "\n\n");
    
      return corrected_description_markdown;
    } else {
      return "";
    }
  };

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
  
  const flatten_documents_by_measure_and_org_id = (documents_by_measure_and_org_id, uniq_id_func, fields_func) => _.flatMap(
    documents_by_measure_and_org_id,
    (documents_by_org_id, measure_id) => _.flatMap(
      documents_by_org_id,
      (documents, org_id) => _.flatMap(
        documents,
        (document, key) => ({
          unique_id: uniq_id_func(measure_id, org_id, document, key),
          ...fields_func(measure_id, org_id, document, key),
        })
      )
    )
  );

  const ommit_unique_id = (documents) => _.map(
    documents,
    document => _.omit(document, "unique_id")
  );
  

  return await Promise.all([
    FakeBudgetOrgSubject.insertMany([
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
    ]),
    ..._.flatMap( budget_years, async (budget_year) => {
      const budget_data = get_standard_csv_file_rows(`budget_${budget_year}_measure_data.csv`);
      const budget_lookups = get_standard_csv_file_rows(`budget_${budget_year}_measure_lookups.csv`);

      const {
        true: measure_lookups,
        false: submeasure_lookups,
      } = _.chain(budget_lookups)
        .map( budget_lookup => ({
          ...budget_lookup,
          description_en: clean_budget_measure_description(budget_lookup.description_en),
          description_fr: clean_budget_measure_description(budget_lookup.description_fr),
        }))
        .groupBy(
          budget_lookups,
          ({parent_measure_id}) => _.isNull(parent_measure_id)
        )
        .value();

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


      const flatten_program_allocations_by_measure_and_org_id = (program_allocations_by_submeasure_and_org_id) => (
        flatten_documents_by_measure_and_org_id(
          program_allocations_by_submeasure_and_org_id,
          (measure_id, org_id, document, key) => `${measure_id}-${org_id}-${key}`,
          (measure_id, org_id, document, key) => ({
            subject_id: key,
            measure_id,
            org_id,

            allocated: document,
          }),
        )
      );


      const submeasures_by_measure_and_org_id = {}; //TODO

      const flatten_submeasures_by_measure_and_org_id = (submeasures_by_measure_and_org_id) => (
        flatten_documents_by_measure_and_org_id(
          submeasures_by_measure_and_org_id,
          (measure_id, org_id, document, key) => `${measure_id}-${org_id}-${document.measure_id}`,
          (measure_id, org_id, document, key) => ({
            submeasure_id: document.measure_id,
            parent_measure_id: measure_id,
            org_id,

            allocated: document.allocated,
            withheld: document.withheld,

            program_allocations: ommit_unique_id(
              flatten_program_allocations_by_measure_and_org_id(
                [{
                  [measure_id]: {
                    [org_id]: _.get(
                      submeasure_program_allocations_by_submeasure_and_org_id,
                      `${measure_id}.${org_id}`,
                    ),
                  },
                }]
              ),
            ),
          }),
        )
      );


      const data_by_measure_and_org_id = {}; //TODO

      const flatten_data_by_measure_and_org_id = (data_by_measure_and_org_id) => (
        flatten_documents_by_measure_and_org_id(
          data_by_measure_and_org_id,
          (measure_id, org_id, document, key) => `${measure_id}-${org_id}`,
          (measure_id, org_id, document, key) => ({
            ...document,

            program_allocations: ommit_unique_id(
              flatten_program_allocations_by_measure_and_org_id(
                [{
                  [measure_id]: {
                    [org_id]: _.get(
                      program_allocations_by_measure_and_org_id,
                      `${measure_id}.${org_id}`,
                    ),
                  },
                }]
              )
            ),

            submeasure_breakouts: ommit_unique_id(
              flatten_submeasures_by_measure_and_org_id(
                [{
                  [measure_id]: {
                    [org_id]: _.get(
                      submeasures_by_measure_and_org_id,
                      `${measure_id}.${org_id}`,
                    ),
                  },
                }]
              ),
            ),
          }),
        )
      );
      
      
      return [
        models[`Budget${budget_year}SubmeasureProgramAllocations`].insertMany( 
          flatten_program_allocations_by_measure_and_org_id(submeasure_program_allocations_by_submeasure_and_org_id)
        ),
        models[`Budget${budget_year}ProgramAllocations`].insertMany( 
          flatten_program_allocations_by_measure_and_org_id(program_allocations_by_measure_and_org_id)
        ),
        models[`Budget${budget_year}Submeasures`].insertMany(
          flatten_submeasures_by_measure_and_org_id(submeasures_by_measure_and_org_id)
        ),
        models[`Budget${budget_year}Data`].insertMany(
          flatten_data_by_measure_and_org_id(data_by_measure_and_org_id)
        ),
        models[`Budget${budget_year}Measures`].insertMany(
          _.map(
            measure_data,
            measure => ({
              ...measure,

              data: ommit_unique_id(
                flatten_data_by_measure_and_org_id(
                  [{
                    [measure.measure_id]: {
                      ...submeasures_by_measure_and_org_id[measure.measure_id],
                    },
                  }]
                )
              ),
            })
          )
        ),
      ];
    }),
  ]);
}