import { get_static_url, make_request } from '../core/request_utils';
import { Subject } from './subject.js';

const { BudgetMeasure } = Subject;

const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );

const load_csv = csv_name => make_request(get_static_url(`csv/${csv_name}.csv`))
  .then( csv_string => parse_csv_string(csv_string) );

const populate_budget_measures = (budget_measures, budget_measure_funds) => {
  const name_col_index = window.lang === "en" ? 1 : 2;
  const budget_measure_funds_in_millions = _.map(budget_measure_funds, row => {
    return {
      measure_id: row[0], 
      org_id: row[1],
      fund: +row[2],
      allocated: +row[3],
      withheld: +row[4],
      remaining: +row[5],
    };
  });
  const budget_funds_by_measure = _.groupBy(budget_measure_funds_in_millions, "measure_id");

  const ref_id_col_index = window.lang === "en" ? 4 : 5;
  const desc_col_index = window.lang === "en" ? 6 : 7;

  _.each(budget_measures, row => {
    const description_text = _.chain(row[desc_col_index])
      .trim()
      .thru( description => description
        .replace(/•/g, "\n\n* ")
        .replace(/((\r\n){1}|\r{1}|\n{1})/gm, "\n\n")
      )
      .thru( description => marked(
        _.trim(description),
        { sanitize: false, gfm: true }
      ) )
      .value()

    BudgetMeasure.create_and_register({
      id: row[0],
      name: row[name_col_index],
      chapter_key: row[3],
      ref_id: row[ref_id_col_index],
      description: description_text,
      funds: budget_funds_by_measure[row[0]],
    });
  }); 
}

export function load_budget_measures(){
  const measure_prom = load_csv("budget_measure_lookups_"+window.lang);
  const funds_prom = load_csv("budget_measure_funds");
  return Promise.all([
    measure_prom,
    funds_prom,
  ]).then( ([budget_measure_lookups, budget_measure_funds]) => {
    populate_budget_measures(budget_measure_lookups, budget_measure_funds);
  });
}
