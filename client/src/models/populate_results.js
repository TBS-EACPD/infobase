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




let _api_subject_ids_with_loaded_results = {};
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
query($lang: String!, $subject_id: String) {
  root(lang: $lang) {
    org(dept_code: $subject_id) {
      ${common_load_results_bundle_fragment}
    }
  }
}
`;
export function api_load_results_bundle(subject){ // TODO: optimize
  const { 
    subject_code,
    query,
    response_data_accessor,
  } = (() => {
    const all_case = {
      subject_code: 'all',
      query: all_load_results_bundle_query,
      response_data_accessor: (response) => response.data.root.orgs,
    };

    if(subject){
      switch(subject.level){
        case 'dept':
          return {
            subject_code: subject.acronym,
            query: dept_load_results_bundle_query,
            response_data_accessor: (response) => [ response.data.root.org ],
          };
        case 'crso':
        case 'program':
          return {
            subject_code: subject.dept.acronym,
            query: dept_load_results_bundle_query,
            response_data_accessor: (response) => [ response.data.root.org ],
          };
        default:
          return all_case;
      }
    } else {
      return all_case;
    }
  })();

  if(_api_subject_ids_with_loaded_results[subject_code] || _api_subject_ids_with_loaded_results['all']){
    return Promise.resolve();
  }

  const client = get_client();
  return client.query({ 
    query,
    variables: {
      lang: window.lang, 
      subject_id: subject_code,
    },
  })
    .then( (response) => {
      const hierarchical_response_data = response_data_accessor(response);

      const {
        sub_programs,
        results,
        indicators,
        pi_dr_links,
      } = extract_flat_data_from_results_hierarchies(hierarchical_response_data);

      _.each( sub_programs, obj => SubProgramEntity.create_and_register(obj) );
      _.each( results, obj => Result.create_and_register(obj) );
      _.each( indicators, obj => Indicator.create_and_register(obj) );
      _.each( pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );

      _api_subject_ids_with_loaded_results[subject_code] = true;
    });
}

function extract_flat_data_from_results_hierarchies(hierarchical_response_data){
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
              indicator.target_year = _.isNaN(parseInt(indicator.target_year)) ? null : parseInt(indicator.target_year);
              indicator.target_month = _.isEmpty(indicator.target_month) ? null : +indicator.target_month;

              indicators.push( _.omit(indicator, "__typename") );
            }
          );
        }
      );
      
      if ( !_.isEmpty(subject.pidrlinks) ){
        _.each(
          subject.pidrlinks,
          (pidrlink) => pi_dr_links.push(pidrlink)
        );
      }

      if ( !_.isEmpty(subject.sub_programs) ){
        _.each(
          subject.sub_programs,
          (sub_program) => {
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
              sub_program[key] = _.isNaN(sub_program[key]) ? null : +sub_program[key];
            });

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
    hierarchical_response_data,
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
  };
}


let api_is_results_count_loaded = {
  summary: false,
  granular: false,
};
const load_results_counts_query = (level = "summary") => gql`
query($lang: String!) {
  root(lang: $lang) {
    gov {
      all_target_counts_${level} {
        subject_id
        level
        drr17_results
        drr17_indicators_met
        drr17_indicators_not_available
        drr17_indicators_not_met
        drr17_indicators_future
        dp18_results
        dp18_indicators
      }
    }
  }
}
`;
export function api_load_results_counts(level = "summary"){
  if(api_is_results_count_loaded[level]){
    return Promise.resolve();
  } else {
    const time_at_request = Date.now()
    const client = get_client();
    return client.query({ query: load_results_counts_query(level), variables: {lang: window.lang} })
      .then( (response) => {
        const resp_time = Date.now() - time_at_request;

        const response_rows = response && response.data.root.gov[`all_target_counts_${level}`];

        if( !_.isEmpty(response_rows) ){
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
        
        const mapped_rows = _.map(
          response_rows,
          row => ({
            ...row,
            id: row.subject_id,
            drr17_past_total: row.drr17_indicators_met + row.drr17_indicators_not_met + row.drr17_indicators_not_available,
            drr17_future_total: row.drr17_indicators_future,
            drr17_total: row.drr17_indicators_met + row.drr17_indicators_not_met + row.drr17_indicators_not_available + row.drr17_indicators_future,
          })
        );

        if (level === "summary"){
          ResultCounts.set_data(mapped_rows);
        } else if (level === "granular"){
          GranularResultCounts.set_data(mapped_rows); 
        }
        api_is_results_count_loaded[level] = true;
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