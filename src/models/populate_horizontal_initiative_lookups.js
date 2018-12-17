import { get_static_url, make_request } from '../core/request_utils';
import { Subject } from './subject.js';

const { Tag } = Subject;

const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );

const load_csv = csv_name => make_request( get_static_url(`csv/${csv_name}.csv`) )
  .then( csv_string => parse_csv_string(csv_string) );

function extend_hi_tags(hi_lookups, hi_to_shared_outcomes, hi_to_dept_ha){

  const processed_hi_lookups = _.chain(hi_lookups)
    .map( ([hi_id, ...lookups]) => [
      hi_id,
      _.chain([
        'lead_dept',
        'start_year',
        'end_year',
        'spending_planned',
        'governance',
        'website',
      ])
        .zip( lookups )
        .fromPairs()
        .value(),
    ])
    .fromPairs()
    .value();

  const processed_hi_to_shared_outcomes = _.chain(hi_to_shared_outcomes)
    .groupBy( ([hi_id, shared_outcome, result]) => hi_id)
    .mapValues(
      hi_grouped_rows => _.map(
        hi_grouped_rows,
        ([hi_id, shared_outcome, result]) => ({shared_outcome, result})
      )
    )
    .value();

  const processed_hi_to_dept_ha = _.chain(hi_to_dept_ha)
    .groupBy( ([hi_id, dept_code, horizontal_activity]) => hi_id )
    .mapValues(
      hi_grouped_rows => _.chain(hi_grouped_rows)
        .groupBy( ([hi_id, dept_code, horizontal_activity]) => dept_code )
        .mapValues(
          dept_subgrouped_rows => _.map(
            dept_subgrouped_rows,
            ([hi_id, dept_code, horizontal_activity]) => horizontal_activity
          )
        )
        .value()
    )
    .value();

  _.each(
    Tag.tag_roots.HI.children_tags,
    ({id}) => Tag.extend(
      id, 
      {
        lookups: {
          ...(processed_hi_lookups[id] || {}),
          shared_outcomes: processed_hi_to_shared_outcomes[id] || {},
          horizontal_activities_by_department: processed_hi_to_dept_ha[id] || {},
        },
      }
    )
  );
};

export function load_horizontal_initiative_lookups(){
  const lookups_prom = load_csv(`hi_lookups_${window.lang}`);
  const shared_outcomes_prom = load_csv(`hi_to_shared_outcomes_${window.lang}`);
  const dept_ha_prom = load_csv(`hi_to_dept_ha_${window.lang}`);
  return Promise.all([
    lookups_prom,
    shared_outcomes_prom,
    dept_ha_prom,
  ]).then( ([hi_lookups, hi_to_shared_outcomes, hi_to_dept_ha]) => {
    extend_hi_tags(hi_lookups, hi_to_shared_outcomes, hi_to_dept_ha);
  });
}