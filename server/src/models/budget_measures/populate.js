import _ from "lodash";
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

  const budget_2018_funds = get_standard_csv_file_rows("budget_2018_measure_funds.csv");
  const budget_2018_lookups = get_standard_csv_file_rows("budget_2018_measure_lookups.csv");


  const orgs_funded_by_measure_id = _.chain(budget_2018_funds)
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


  const net_adjust_lookup = _.find(
    budget_2018_lookups,
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
  
  await BudgetMeasures.insertMany(budget_measures);
  return await SpecialFundingSubject.insertMany(special_funding_subject);
}