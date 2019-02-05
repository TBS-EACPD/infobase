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

export default function({models}){
  const {
    BudgetMeasures,
    BudgetFunds,
    SpecialFundingCase,
  } = models;

  const budget_funds = get_standard_csv_file_rows("budget_measure_funds.csv");
  const budget_measures = get_standard_csv_file_rows("budget_measure_lookups.csv");


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

  _.each( processed_budget_funds, budget_fund_row => BudgetFunds.register(budget_fund_row) );

  const net_adjust_measure = BudgetMeasures.get_measure_by_id("net_adjust");
  const special_funding_case_net_adjust = {
    id: net_adjust_measure.measure_id,
    org_id: net_adjust_measure.measure_id,
    level: "special_funding_case",
    name_en: net_adjust_measure.measure_en,
    name_fr: net_adjust_measure.measure_fr,
    description_en: "",
    description_fr: "",
  };
  SpecialFundingCase.register(special_funding_case_net_adjust);

  const special_funding_case_non_allocated = {
    id: "non_allocated",
    org_id: "non_allocated",
    level: "special_funding_case",
    name_en: "Allocation to be determined",
    name_fr: "Affectation à determiner",
    description_en: "",
    description_fr: "",
  };
  SpecialFundingCase.register(special_funding_case_non_allocated);

}