import { get_static_url, make_request } from '../core/request_utils';
import { Subject } from './subject.js';

const { BudgetMeasure } = Subject;

const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );

const load_csv = csv_name => make_request(get_static_url(`csv/${csv_name}.csv`))
  .then( csv_string => parse_csv_string(csv_string) );

const populate_budget_measures = (budget_measure_lookups, budget_measure_data) => {
  const budget_data_by_measure = _.chain(budget_measure_data)
    .map(row => {
      const standard_fields = {
        measure_id: row[0], 
        org_id: row[1],
        funding: +row[2],
        allocated: +row[3],
        withheld: +row[4],
        remaining: +row[5],
      };

      const program_fields = _.chain(row)
        .drop(6)
        .filter(cell => cell !== "")
        .chunk(2)
        .fromPairs()
        .value();

      return _.assign({}, standard_fields, {program_allocations: program_fields});
    })
    .groupBy("measure_id")
    .value();

  _.each(budget_measure_lookups, row => {
    const description_text = _.chain(row[5])
      .trim()
      .thru( description => description
        .replace(/•/g, "\n\n* ")
        .replace(/((\r\n){1}|\r{1}|\n{1})/gm, "\n\n")
      )
      .thru( description => marked(
        _.trim(description),
        { sanitize: false, gfm: true }
      ) )
      .value();
    
    BudgetMeasure.create_and_register({
      id: row[0],
      parent_id: row[1],
      name: row[2],
      chapter_key: row[3],
      ref_id: row[4],
      description: description_text,
      data: budget_data_by_measure[row[0]],
    });
  }); 
}

export function load_budget_measures(){
  const lookups_prom = load_csv("budget_measure_lookups_"+window.lang);
  const data_prom = load_csv("budget_measure_data");
  return Promise.all([
    lookups_prom,
    data_prom,
  ]).then( ([budget_measure_lookups, budget_measure_data]) => {
    populate_budget_measures(budget_measure_lookups, budget_measure_data);
  });
}
