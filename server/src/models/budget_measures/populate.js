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
  const { 
    BudgetMeasures,
    SpecialFundingSubject,
  } = models;

  return await Promise.all( _.flatMap(
    budget_years,
    (budget_year) => {
      const budget_funds = get_standard_csv_file_rows(`budget_${budget_year}_measure_data.csv`);
      const budget_lookups = get_standard_csv_file_rows(`budget_${budget_year}_measure_lookups.csv`);
    
    
      const submeasures_by_parent_measure_id = _.chain(budget_lookups)
        .filter("parent_measure_id")
        .groupBy("parent_measure_id")
        .mapValues( 
          grouped_submeasure_rows => _.map(
            grouped_submeasure_rows, 
            "measure_id"
          ) 
        )
        .value();
      const submeasure_ids = _.flatMap(submeasures_by_parent_measure_id, _.identity);
      
      const {
        true: budget_measure_funds,
        false: budget_submeasure_funds,
      } = _.groupBy(
        budget_funds,
        ({measure_id}) => !_.includes(submeasure_ids, measure_id)
      );
      const {
        true: budget_measure_lookups,
        false: budget_submeasure_lookups,
      } = _.groupBy(
        budget_lookups,
        ({parent_measure_id}) => _.isNull(parent_measure_id)
      );
    
      debugger
    
      // vvv OLD CODE, but parts of it will still apply to the new data loading process, so keeping around while working vvv 
      //const orgs_funded_by_measure_id = _.chain(budget_funds)
      //  .groupBy("measure_id")
      //  .mapValues( grouped_fund_rows => _.flatMap(grouped_fund_rows, fund_row => fund_row.org_id) )
      //  .value();

      //const processed_budget_measures = _.chain(budget_measures)
      //  .clone()
      //  .each(budget_measures, 
      //    budget_measure => _.each(budget_measure, 
      //      (value, key) => key.includes("description") ? budget_measure[key] = clean_budget_measure_description(value) : null
      //    )
      //  )
      //  .value();

      //const processed_budget_measures_with_funded_orgs_lists = _.map(processed_budget_measures, 
      //  budget_measure => _.assign(
      //    {}, 
      //    budget_measure, 
      //    {
      //      id: budget_measure.measure_id,
      //      funded_org_ids: orgs_funded_by_measure_id[budget_measure.measure_id],
      //    }
      //  )
      //);

      //_.each( processed_budget_measures_with_funded_orgs_lists, budget_measure => BudgetMeasures.register(budget_measure) );


      //const processed_budget_funds = _.chain(budget_funds)
      //  .clone()
      //  .each(
      //    (budget_fund_row, index) => {
      //      _.each(budget_fund_row, 
      //        (value, key) => (key.startsWith("budget_") ? budget_fund_row[key] = +value : null)
      //      )
      //    }
      //  )
      //  .value();
    
    
      const net_adjust_lookup = _.find(
        budget_lookups,
        (budget_measure_lookup) => budget_measure_lookup.measure_id === "net_adjust"
      );
      const special_funding_subject = [
        {
          subject_id: "net_adjust",
          level: "special_funding_case",
          name_en: net_adjust_lookup.measure_en,
          name_fr: net_adjust_lookup.measure_fr,
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
      
      return [
        SpecialFundingSubject.insertMany(special_funding_subject),
        BudgetMeasures.insertMany(budget_measures),
      ];
    })
  )
}