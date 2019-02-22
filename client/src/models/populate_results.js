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
const results_fragment = (doc) => `
results(doc: ${doc}) {
  id
  parent_id
  name
  doc
  indicators {
    id
    result_id
    name
    target_year
    target_month
    target_type
    target_min
    target_max
    target_narrative
    doc

    explanation

    actual_result
    actual_datatype
    actual_result
    
    status_key

    methodology
    measure
  }
}
`;
const common_load_results_bundle_fragment = `
dept_code
crsos {
  id
  drr17_results: ${results_fragment('"drr17"')}
  dp18_results: ${results_fragment('"dp18"')}
}
programs {
  id
  drr17_results: ${results_fragment('"drr17"')}
  dp18_results: ${results_fragment('"dp18"')}
  pidrlinks {
    program_id
    result_id
  }
  sub_programs {
    id
    drr17_results: ${results_fragment('"drr17"')}
    dp18_results: ${results_fragment('"dp18"')}
    name
    description
    drr_fte_expl
    drr_spend_expl
    dp_fte_trend_expl
    dp_spend_trend_expl
    dp_no_fte_expl
    dp_no_spending_expl
    sub_programs {
      id
      drr17_results: ${results_fragment('"drr17"')}
      dp18_results: ${results_fragment('"dp18"')}
      name
      description
      drr_fte_expl
      drr_spend_expl
      dp_fte_trend_expl
      dp_spend_trend_expl
      dp_no_fte_expl
      dp_no_spending_expl
    }
  }
}
`;
const all_load_results_bundle_query = gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      ${common_load_results_bundle_fragment}
    }
  }
}
`;
const dept_load_results_bundle_query = gql`
query($lang: String!, $dept_code: String) {
  root(lang: $lang) {
    org(dept_code: $dept_code) {
      ${common_load_results_bundle_fragment}
    }
  }
}
`;
export function api_load_results_bundle(subject){
  let subject_code;
  if(subject){
    switch(subject.level){
      case 'dept':
        subject_code = subject.acronym;
        break;
      case 'crso':
      case 'program':
        subject_code = subject.dept.acronym;
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

  const client = get_client();
  return client.query({ 
    query: subject_code === 'all' ?
      all_load_results_bundle_query :
      dept_load_results_bundle_query, 
    variables: {
      lang: window.lang, 
      dept_code: subject_code,
    },
  })
    .then( (response) => {
      const org_result_hierarchies = subject_code === 'all' ?
        response.data.root.orgs :
        [ response.data.root.org ];

      const {
        sub_programs,
        results,
        indicators,
        pi_dr_links,
      } = extract_flat_data_from_results_hierarchies(org_result_hierarchies);

      _.each( sub_programs, obj => SubProgramEntity.create_and_register(obj) );
      _.each( results, obj => Result.create_and_register(obj) );
      _.each( indicators, obj => Indicator.create_and_register(obj) )
      _.each( pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );

      _api_loaded_dept_or_tag_codes[subject_code] = true;
    });
}

function extract_flat_data_from_results_hierarchies(org_result_hierarchies){
  const sub_programs = [],
    results = [],
    indicators = [],
    pi_dr_links = [];

  const crawl_hierachy_level = (subject_node) => _.each(
    subject_node,
    subject => {
      _.each(
        [...subject.drr17_results, ...subject.dp18_results],
        (result) => {
          results.push({
            id: result.id,
            subject_id: subject.id,
            name: result.name,
            doc: result.doc,
          });

          _.each(
            result.indicators,
            (indicator) => {
              indicators.push( _.omit(indicator, "__typename") );
            }
          );
        }
      );
      
      if ( !_.isEmpty(subject.pidrlinks) ){
        _.each(
          subject.pidrlinks,
          ({program_id, result_id}) => pi_dr_links.push([program_id, result_id])
        );
      }

      if ( !_.isEmpty(subject.sub_programs) ){
        _.each(
          subject.sub_programs,
          (sub_program) => {
            sub_programs.push({
              ..._.omit(sub_program, "__typename"),
              parent_id: subject.id,
            });
          }
        );

        crawl_hierachy_level(subject.sub_programs);
      }
    }
  );

  _.each(
    org_result_hierarchies,
    org_result_hierarchy => {
      crawl_hierachy_level(org_result_hierarchy.crsos);

      crawl_hierachy_level(org_result_hierarchy.programs);
    }
  );

  return {
    sub_programs,
    results,
    indicators,
    pi_dr_links,
  }
}


let api_is_results_count_loaded = false;
const load_results_counts_query = gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs{
      dept_code
      drr17_counts: target_counts(doc: "drr17") {
        results
        met
        not_available
        not_met
        future
      }
      dp18_counts: target_counts(doc: "dp18") {
        results
        dp
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
    return client.query({ query: load_results_counts_query, variables: {lang: window.lang} })
      .then( (response) =>{
        const resp_time = Date.now() - time_at_request;

        const format_drr17_counts = (drr17_counts) => ({
          drr17_results: drr17_counts.results,
          ..._.chain(drr17_counts)
            .omit(["__typename", "results"])
            .mapKeys( (value, key) => `drr17_indicators_${key}` )
            .value(),
          drr17_past_total: _.chain(drr17_counts)
            .omit(["__typename", "results", "future"])
            .reduce( (memo, count) => memo + count, 0 )
            .value(),
          drr17_future_total: _.isNull(drr17_counts) ? 0 : drr17_counts.future,
          drr17_total: _.chain(drr17_counts)
            .omit(["__typename", "results"])
            .reduce( (memo, count) => memo + count, 0 )
            .value(),
        });
        const format_dp18_counts = (dp18_counts) => ({
          dp18_results: _.isNull(dp18_counts) ? 0 : dp18_counts.results,
          dp18_indicators: _.isNull(dp18_counts) ? 0 : dp18_counts.dp,
        });

        const counts_by_dept = response && _.chain(response.data.root.orgs)
          .filter( data => !_.isNull(data.drr17_counts) || !_.isNull(data.dp18_counts) )
          .map(
            ({
              dept_code, 
              drr17_counts,
              dp18_counts,
            }) => ({
              id: dept_code,
              level: "dept",
              ...format_drr17_counts(drr17_counts),
              ...format_dp18_counts(dp18_counts),
            })
          )
          .value();

        if( !_.isEmpty(counts_by_dept) ){
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
        
        const rows = [
          ...counts_by_dept,
          {
            id: "total",
            level: "all",
            ..._.reduce(
              counts_by_dept,
              (memo, row) => _.mapValues(
                memo,
                (memo_value, key) => memo_value + row[key]
              ),
              _.chain({ ...counts_by_dept[0] })
                .omit(["id", "level"])
                .mapValues( () => 0 )
                .value()
            ),
          },
        ]
        
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