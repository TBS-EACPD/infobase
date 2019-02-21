import { get_static_url, make_request } from '../request_utils.js';
import { get_client } from '../graphql_utils.js';
import gql from 'graphql-tag';
import { log_standard_event } from '../core/analytics.js';
import { 
  Indicator, 
  Result, 
  SubProgramEntity, 
  PI_DR_Links, 
  ResultCounts,
  GranularResultCounts,
} from './results.js';

let _loaded_dept_or_tag_codes = {};

export function load_results_bundle(subject){
  
  let subject_code;
  if(subject){
    switch(subject.level){
      case 'dept':
        subject_code = subject.acronym;
        break;
      case 'program':
        subject_code = subject.dept.acronym;
        break;
      case 'crso':
        subject_code = subject.dept.acronym;
        break;
      case 'tag':
        subject_code = subject.id;
        break;
      default:
        subject_code = 'all';
        break;
    }
  } else {
    subject_code = 'all';
  }

  if(_loaded_dept_or_tag_codes[subject_code] || _loaded_dept_or_tag_codes['all']){
    return Promise.resolve();
  }

  const { lang } = window;

  return make_request( get_static_url(`results/results_bundle_${lang}_${subject_code}.json.js`) )
    .then(response => {
      populate_results_info(JSON.parse(response));
    }).then( ()=> {
      _loaded_dept_or_tag_codes[subject_code] = true;
    });
     

}

let is_results_count_loaded = false;
export function load_results_counts(){
  if(is_results_count_loaded){
    return Promise.resolve();

  } else {
    return make_request( get_static_url(`results/results_summary.json.js` ))
      .then(response => {
        const rows = d3.csvParse(response);
        _.each(rows, row => {
          _.each(row, (val,key) => {
            if(!_.isNaN(+val)){
              row[key] = +val;
            }
          });
        });
        ResultCounts.set_data(rows); 
        is_results_count_loaded = true;
      });
  }
}

let is_granular_results_count_loaded = false;
export function load_granular_results_counts(){
  if(is_granular_results_count_loaded){
    return Promise.resolve();
  } else {
    return make_request( get_static_url(`results/results_summary_granular.json.js` ))
      .then(response => {
        const rows = d3.csvParse(response);
        _.each(rows, row => {
          _.each(row, (val,key) => {
            if(!_.isNaN(+val)){
              row[key] = +val;
            }
          });
        });
        GranularResultCounts.set_data(rows); 
        is_granular_results_count_loaded = true;
      });
  }
}

function populate_results_info(data){
  //most of the results data is csv-row based, without headers.
  _.each(['results', 'indicators', 'pi_dr_links', 'sub_programs'], key => {
    data[key] = d3.csvParse(data[key]);
  })

  const {
    results,
    sub_programs,
    indicators,
    pi_dr_links,
  } = data;

  _.each(sub_programs, obj => {

    _.each([
      "spend_planning_year_1",
      "spend_planning_year_2",
      "spend_planning_year_3",
      "fte_planning_year_1",
      "fte_planning_year_2",
      "fte_planning_year_3",
      "spend_pa_last_year",
      "fte_pa_last_year",
      "planned_spend_pa_last_year",
      "planned_fte_pa_last_year",
    ], key => {
      obj[key] = _.isNaN(obj[key]) ? null : +obj[key];
    });

    SubProgramEntity.create_and_register(obj);
  });

  _.each(results, obj => Result.create_and_register(obj) );

  _.each(indicators, obj => {
    
    const {
      actual_result,
      target_year,
      target_month,
    } = obj;

    obj.actual_result = _.isNull(actual_result) || actual_result === '.' ? null : actual_result;
    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month = _.isEmpty(target_month) ? null : +target_month;

    Indicator.create_and_register(obj);
  })

  _.each( pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );

}




let _api_loaded_dept_or_tag_codes = {};
export function api_load_results_bundle(subject){
  let subject_code;
  if(subject){
    switch(subject.level){
      case 'dept':
        subject_code = subject.acronym;
        break;
      case 'program':
        subject_code = subject.dept.acronym;
        break;
      case 'crso':
        subject_code = subject.dept.acronym;
        break;
      case 'tag':
        subject_code = subject.id;
        break;
      default:
        subject_code = 'all';
        break;
    }
  } else {
    subject_code = 'all';
  }

  if(_api_loaded_dept_or_tag_codes[subject_code] || _api_loaded_dept_or_tag_codes['all']){
    return Promise.resolve();
  }

  const { lang } = window;

  return make_request( get_static_url(`results/results_bundle_${lang}_${subject_code}.json.js`) )
    .then(response => {
      api_populate_results_info(JSON.parse(response));
    }).then( ()=> {
      _api_loaded_dept_or_tag_codes[subject_code] = true;
    });
}

function api_populate_results_info(data){
  //most of the results data is csv-row based, without headers.
  _.each(['results', 'indicators', 'pi_dr_links', 'sub_programs'], key => {
    data[key] = d3.csvParse(data[key]);
  })

  const {
    results,
    sub_programs,
    indicators,
    pi_dr_links,
  } = data;

  _.each(sub_programs, obj => {

    _.each([
      "spend_planning_year_1",
      "spend_planning_year_2",
      "spend_planning_year_3",
      "fte_planning_year_1",
      "fte_planning_year_2",
      "fte_planning_year_3",
      "spend_pa_last_year",
      "fte_pa_last_year",
      "planned_spend_pa_last_year",
      "planned_fte_pa_last_year",
    ], key => {
      obj[key] = _.isNaN(obj[key]) ? null : +obj[key];
    });

    SubProgramEntity.create_and_register(obj);
  });

  _.each(results, obj => Result.create_and_register(obj) );

  _.each(indicators, obj => {
    
    const {
      actual_result,
      target_year,
      target_month,
    } = obj;

    obj.actual_result = _.isNull(actual_result) || actual_result === '.' ? null : actual_result;
    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month = _.isEmpty(target_month) ? null : +target_month;

    Indicator.create_and_register(obj);
  })

  _.each( pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );
}


let api_is_results_count_loaded = false;
const load_results_counts_query = gql`
query($lang: String!, $doc: String) {
  root(lang: $lang) {
    orgs{
      dept_code
      target_counts(doc: $doc) {
        results
        dp
        met
        not_available
        not_met
        future
      }
    }
  }
}
`;
export function api_load_results_counts(){
  if(api_is_results_count_loaded){
    return Promise.resolve();
  } else {
    const time_at_request = Date.now()
    const client = get_client();
    return Promise.all([
      client.query({ query: load_results_counts_query, variables: {lang: window.lang, doc: "drr17"} }),
      client.query({ query: load_results_counts_query, variables: {lang: window.lang, doc: "dp18"} }),
    ])
      .then(function([drr17_resp, dp18_resp]){
        const resp_time = Date.now() - time_at_request;

        const drr17_counts_by_dept = drr17_resp && _.chain(drr17_resp.data.root.orgs)
          .filter( data => !_.isNull(data.target_counts) )
          .map(
            ({
              dept_code, 
              target_counts,
            }) => ({
              id: dept_code,
              level: "dept",
              drr17_results: target_counts.results,
              ..._.chain(target_counts)
                .omit(["__typename", "results", "dp"])
                .mapKeys( (value, key) => `drr17_indicators_${key}` )
                .value(),
              drr17_past_total: _.chain(target_counts)
                .omit(["__typename", "results", "dp", "future"])
                .reduce( (memo, count) => memo + count, 0 )
                .value(),
              drr17_future_total: target_counts.future,
              drr17_total: _.chain(target_counts)
                .omit(["__typename", "results", "dp"])
                .reduce( (memo, count) => memo + count, 0 )
                .value(),
            })
          )
          .value();

        const dp18_counts_by_dept = dp18_resp && _.chain(dp18_resp.data.root.orgs)
          .filter( data => !_.isNull(data.target_counts) )
          .map(
            ({
              dept_code, 
              target_counts: {
                results,
                dp,
              },
            }) => ({
              id: dept_code,
              level: "dept",
              dp18_results: results,
              dp18_indicators: dp,
            })
          )
          .value();

        if( !_.isEmpty(drr17_counts_by_dept) && !_.isEmpty(dp18_counts_by_dept) ){
          // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
          log_standard_event({
            SUBAPP: window.location.hash.replace('#',''),
            MISC1: "API_QUERY_SUCCESS",
            MISC2: `Results counts, took ${resp_time} ms`,
          });
        } else {
          log_standard_event({
            SUBAPP: window.location.hash.replace('#',''),
            MISC1: "API_QUERY_UNEXPECTED",
            MISC2: `Results counts, took ${resp_time} ms`,
          });  
        }
        
        const rows = _.chain([...drr17_counts_by_dept, ...dp18_counts_by_dept])
          .groupBy("id")
          .map( dept_data => _.merge(...dept_data) )
          .thru(all_dept_rows => [
            ...all_dept_rows,
            {
              id: "total",
              level: "all",
              ..._.reduce(
                all_dept_rows,
                (memo, row) => _.mapValues(
                  memo,
                  (memo_value, key) => memo_value + row[key]
                ),
                _.chain({
                  ...drr17_counts_by_dept[0], 
                  ...dp18_counts_by_dept[0],
                })
                  .omit(["id", "level"])
                  .mapValues( () => 0 )
                  .value()
              ),
            },
          ])
          .value();

        ResultCounts.set_data(rows); 
        api_is_results_count_loaded = true;
      })
      .catch(function(error){
        const resp_time = Date.now() - time_at_request;     
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_FAILURE",
          MISC2: `Results counts, took  ${resp_time} ms - ${error.toString()}`,
        });
      });
  }
}