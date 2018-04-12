import { BudgetMeasure } from './subject';
import { fetch_and_inflate } from '../core/utils.js';

const parse_csv_string = csv_string => _.tail( d3.csvParseRows( $.trim(csv_string) ) );

const load_csv = csv_name => (
  window.binary_download && !window.isIE() ? 
    fetch_and_inflate(`csv/${csv_name}.csv_min.html`) :
    $.ajax({ url: `csv/${csv_name}.csv` })   
).then( csv_string => parse_csv_string(csv_string) );

const populate_budget_measures = (budget_measures, budget_measure_funds) => {
  const name_col_index = window.lang === "en" ? 1 : 2;
  const budget_measure_funds_in_millions = _.map(budget_measure_funds, row => [
    row[0], 
    row[1], 
    row[2] * 1000000,
  ]);
  const budget_funds_by_measure = _.groupBy(budget_measure_funds_in_millions, row => row[0]);

  _.each(budget_measures, row => {
    BudgetMeasure.create_and_register({
      id: row[0],
      name: row[name_col_index],
      chapter_key: row[3],
      funds: budget_funds_by_measure[row[0]],
    });
  }); 
}

export function load_budget_measures(){
  const measure_prom = load_csv("budget_measure_lookups");
  const funds_prom = load_csv("budget_measure_funds");
  return $.when(
    measure_prom,
    funds_prom
  ).then( (budget_measure_lookups, budget_measure_funds) => {
    populate_budget_measures(budget_measure_lookups, budget_measure_funds);
  });
}
