import { BudgetMeasure }from './subject';
import { fetch_and_inflate } from '../core/utils.js';

const parse_csv_string = csv_string => _.tail(d3.csvParseRows($.trim(csv_string)));

const load_csv = csv_name => (
  window.binary_download && !window.isIE() ? 
    fetch_and_inflate(`csv/${csv_name}.csv_min.html`) :
    $.ajax({ url: `csv/${csv_name}.csv` })   
).then( csv_string => parse_csv_string(csv_string) );

const populate_budget_measures = (budget_measures, budget_measure_allocations) => {
  const name_col_index = window.lang === "en" ? 1 : 2;
  const budget_allocations_by_measure = _.groupBy(budget_measure_allocations, row => row[0]);

  _.each(budget_measures, row => {
    BudgetMeasure.create_and_register({
      id: row[0],
      name: row[name_col_index],
      allocations: budget_allocations_by_measure[row[0]],
    });
  }); 
}

export function load_budget_measures(){
  const measure_prom = load_csv("budget_measure_lookups");
  const allocations_prom = load_csv("budget_measure_allocations");
  return $.when(
    measure_prom,
    allocations_prom
  ).then( (budget_measure_lookups, budget_measure_allocations) => {
    populate_budget_measures(budget_measure_lookups, budget_measure_allocations);
  });
}
