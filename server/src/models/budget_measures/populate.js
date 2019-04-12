import _ from "lodash";

import { budget_years } from './budget_measures_common.js';

import { get_standard_csv_file_rows } from '../load_utils.js';
import { rejects } from "assert";

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
  const { SpecialFundingSubject } = models;

  const igoc_rows = get_standard_csv_file_rows(`igoc.csv`);
  const dept_codes_by_org_ids = _.chain(igoc_rows)
    .map( ({org_id, dept_code}) => [org_id, dept_code])
    .fromPairs()
    .value();

  const special_funding_subjects = [
    {
      subject_id: "net_adjust",
      level: "special_funding_case",
      name_en: "Net adjustment to be on a 2018-19 Estimates Basis",
      name_fr: "Rajustement net selon le Budget des dépenses de 2018-2019",
      description_en: "",
      description_fr: "",
    },
    {
      subject_id: "non_allocated",
      level: "special_funding_case",
      name_en: "Allocation to be determined",
      name_fr: "Affectation à determiner",
      description_en: "",
      description_fr: "",
    },
  ];
  
  return await Promise.all([
    SpecialFundingSubject.insertMany(special_funding_subjects),
    ..._.flatMap( budget_years, async (budget_year) => {
      const budget_funds = get_standard_csv_file_rows(`budget_${budget_year}_measure_data.csv`);
      const budget_lookups = get_standard_csv_file_rows(`budget_${budget_year}_measure_lookups.csv`);

      const {
        true: measure_lookups,
        false: submeasure_lookups,
      } = _.groupBy(
        budget_lookups,
        ({parent_measure_id}) => _.isNull(parent_measure_id)
      );
      const submeasure_ids = _.map(submeasure_lookups, "measure_id");
      const {
        true: measure_funds,
        false: submeasure_funds,
      } = _.groupBy(
        budget_funds,
        ({measure_id}) => !_.includes(submeasure_ids, measure_id)
      );
    
      const submeasure_program_allocations = _.chain(submeasure_funds)
        .filter( ({allocated}) => +allocated !== 0 )
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
                .thru( ([activity_codes, allocation_values]) => _.zip(activity_codes, allocation_values) )
                .fromPairs()
                .omit("null")
                .mapKeys( (allocation_value, activity_code) => `${dept_code}-${activity_code}`)
                .value();

              return [measure_id, program_allocations];
            }
          }
        )
        .fromPairs()
        .value();

      debugger
      
      return [
        models[`Budget${budget_year}Measures`].insertMany(["TODO"]),
        models[`Budget${budget_year}Data`].insertMany(["TODO"]),
        models[`Budget${budget_year}Submeasures`].insertMany(["TODO"]),
        models[`Budget${budget_year}ProgramAllocation`].insertMany(["TODO"]),
      ];
    
      // vvv OLD CODE, but parts of it will still apply to the new data loading process, so keeping around while working vvv
      /* eslint-disable */
      const orgs_funded_by_measure_id = _.chain(budget_funds)
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


      const processed_budget_funds = _.chain(budget_funds)
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