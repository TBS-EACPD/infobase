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

let _api_subject_ids_with_loaded_results = {};
const sub_program_fields = `
id
name
description
spend_planning_year_1
spend_planning_year_2
spend_planning_year_3
fte_planning_year_1
fte_planning_year_2
fte_planning_year_3
dp_no_spending_expl
dp_spend_trend_expl
dp_no_fte_expl
dp_fte_trend_expl
spend_pa_last_year
fte_pa_last_year
planned_spend_pa_last_year
planned_fte_pa_last_year
drr_spend_expl
drr_fte_expl
`;
const results_fields_fragment = (docs_to_load) => _.chain(docs_to_load)
  .map(doc =>`
${doc}_results: results(doc: "${doc}") {
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
}`)
  .reduce( (memo, fragment) => `
${memo}
${fragment}`)
  .value();
const program_results_fragment = (docs_to_load) => `
id
${results_fields_fragment(docs_to_load)}
pidrlinks {
  program_id
  result_id
}
sub_programs {
  ${sub_program_fields}
  ${results_fields_fragment(docs_to_load)}
  sub_programs {
    ${sub_program_fields}
    ${results_fields_fragment(docs_to_load)}
  }
}
`;
const crso_load_results_bundle_fragment = (docs_to_load) => `
id
${results_fields_fragment(docs_to_load)}
`;
const get_program_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    program(id: $id) {
      id
      ${program_results_fragment(docs_to_load)}
    }
  }
}
`;
const get_crso_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    crso(id: $id) {
      id
      ${crso_load_results_bundle_fragment(docs_to_load)}
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;
const get_dept_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      crsos {
        ${crso_load_results_bundle_fragment(docs_to_load)}
      }
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;
const get_all_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      id
      crsos {
        ${crso_load_results_bundle_fragment(docs_to_load)}
      }
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;
export function api_load_results_bundle(subject, result_docs){
  const docs_to_load = !_.isEmpty(result_docs) ? result_docs : ["drr17", "dp18"];

  const level = subject && subject.level || 'all';

  const {
    is_loaded,
    id,
    query,
    response_data_accessor,
  } = (() => {
    const subject_is_loaded = ({level, id}) => _.every(
      docs_to_load,
      doc => _.get(_api_subject_ids_with_loaded_results, `${doc}.${level}.${id}`)
    );

    const all_is_loaded = () => subject_is_loaded({level: 'all', id: 'all'});
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);
    const crso_is_loaded = (crso) => dept_is_loaded(crso.dept) || subject_is_loaded(crso);
    const program_is_loaded = (program) => crso_is_loaded(program.crso) || subject_is_loaded(program);

    switch(level){
      case 'program':
        return {
          is_loaded: program_is_loaded(subject),
          id: subject.id,
          query: get_program_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [ response.data.root.program ],
        };
      case 'crso':
        return {
          is_loaded: crso_is_loaded(subject),
          id: subject.id,
          query: get_crso_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [ response.data.root.crso ],
        };
      case 'dept':
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: get_dept_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [ response.data.root.org ],
        };
      default:
        return {
          is_loaded: all_is_loaded(subject),
          id: 'all',
          query: get_all_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => response.data.root.orgs,
        };
    }
  })();

  if( is_loaded ){
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client.query({ 
    query,
    variables: {
      lang: window.lang, 
      id,
    },
  })
    .then( (response) => {
      const hierarchical_response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request; 
      if( !_.isEmpty(hierarchical_response_data) ){
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Results, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Results, took ${resp_time} ms`,
        });  
      }

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

      _.each(
        docs_to_load,
        // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
        // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
        doc => _.setWith(_api_subject_ids_with_loaded_results, `${doc}.${level}.${id}`, true, Object)
      );
    })
    .catch(function(error){
      const resp_time = Date.now() - time_at_request;     
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Results, took  ${resp_time} ms - ${error.toString()}`,
      });
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
        [ ...(subject.drr17_results || []), ...(subject.dp18_results || [])],
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
              indicator.target_year = _.isEmpty(indicator.target_year) ? null : parseInt(indicator.target_year);
              indicator.target_month = _.isEmpty(indicator.target_month) ? null : parseInt(indicator.target_month);

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

            const cleaned_sub_program = _.chain(sub_program)
              .cloneDeep()
              .omit("__typename")
              .thru( sub_program => {
                _.each(
                  [
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
                  ], 
                  key => {
                    sub_program[key] = _.isNaN(sub_program[key]) ? null : +sub_program[key];
                  }
                );

                return {
                  ...sub_program,
                  parent_id: subject.id,
                };
              })
              .value();

            sub_programs.push(cleaned_sub_program);
          }
        );

        crawl_hierachy_level(subject.sub_programs);
      }
    }
  );

  _.each(
    hierarchical_response_data,
    response => {
      switch(response.__typename){
        case 'Program':
          crawl_hierachy_level([ response ]);
          break;
        case 'Crso':
          crawl_hierachy_level([ response ]);
          crawl_hierachy_level(response.programs);
          break;
        default:
          crawl_hierachy_level(response.crsos);
          crawl_hierachy_level(response.programs);
      }
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
    const time_at_request = Date.now();
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