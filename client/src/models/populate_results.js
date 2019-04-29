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
  result_docs,
} from './results.js';

const result_doc_keys = _.keys(result_docs);

const has_results_query = (level, id_key) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    ${level}(${id_key}: $id) {
      id
      has_results
    }
  }
}
`;
const _subject_has_results = {}; // This is also populated as a side effect of api_load_results_bundle and api_load_results_counts calls
export function subject_has_results(subject){
  const { id } = subject;

  const level = subject.level === "dept" ? "org" : subject.level;

  if ( !_.isUndefined(subject.is_internal_service) && subject.is_internal_service){
    subject.set_has_data('results_data', false);
    return Promise.resolve();
  }

  if( !_.isUndefined(_subject_has_results[id]) ){
    subject.set_has_data('results_data', _subject_has_results[id]); // if _subject_has_results was populated by sie effect, subject may not have had value set yet 
    return Promise.resolve();
  } else {
    const time_at_request = Date.now();
    const client = get_client();

    const id_key = level === "org" ? "org_id" : "id";

    return client.query({ query: has_results_query(level, id_key), variables: {lang: window.lang, id: id} })
      .then( (response) => {
        const resp_time = Date.now() - time_at_request;

        const has_results = response && response.data.root[level].has_results;

        if( _.isBoolean(has_results) ){
          log_standard_event({
            SUBAPP: window.location.hash.replace('#',''),
            MISC1: "API_QUERY_SUCCESS",
            MISC2: `Has results, took ${resp_time} ms`,
          });
        } else {
          log_standard_event({
            SUBAPP: window.location.hash.replace('#',''),
            MISC1: "API_QUERY_UNEXPECTED",
            MISC2: `Has results, took ${resp_time} ms`,
          });  
        }

        _subject_has_results[id] = has_results;
        subject.set_has_data('results_data', has_results);

        return Promise.resolve();
      })
      .catch(function(error){
        const resp_time = Date.now() - time_at_request;     
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_FAILURE",
          MISC2: `Has results, took  ${resp_time} ms - ${error.toString()}`,
        });
        throw error;
      });
  }
}


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
  stable_id
  parent_id
  name
  doc

  indicators {
    id
    stable_id
    result_id
    name
    doc

    target_year
    target_month

    target_type
    target_min
    target_max
    target_narrative
    measure

    previous_year_target_type
    previous_year_target_min
    previous_year_target_max
    previous_year_target_narrative
    previous_year_measure

    explanation

    actual_datatype
    actual_result
    
    status_key

    methodology
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
  const docs_to_load = !_.isEmpty(result_docs) ? result_docs : result_doc_keys;

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
        doc => {
          _.setWith(_api_subject_ids_with_loaded_results, `${doc}.${level}.${id}`, true, Object);

          _subject_has_results[id] = _.nonEmpty(results); // side effect
        }
      );

      return Promise.resolve();
    })
    .catch(function(error){
      const resp_time = Date.now() - time_at_request;     
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Results, took  ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
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
        _.chain(subject)
          .pickBy( (value, key) => /(drr|dp)[0-9][0-9]_results/.test(key) )
          .reduce( 
            (memo, doc_results) => [ ...memo, ...doc_results],
            []
          )
          .value(),
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
      id
      all_target_counts_${level} {
        subject_id
        level
${ // Weird indentation ahead, so that the template output has the right spacing
  _.chain(result_doc_keys)
    .map(
      (doc_key) => /drr/.test(doc_key) ?
        `
        ${doc_key}_results
        ${doc_key}_indicators_met
        ${doc_key}_indicators_not_available
        ${doc_key}_indicators_not_met
        ${doc_key}_indicators_future` :
        `
        ${doc_key}_results
        ${doc_key}_indicators`
    )
    .reduce( (memo, fragment) => `${memo}
${fragment}`)
    .value()
}
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
          row => {
            const null_zeroed_row = _.mapValues(row, (value) => _.isNull(value) ? 0 : value );
            return {
              ...null_zeroed_row,
              id: null_zeroed_row.subject_id,
              drr17_past_total: null_zeroed_row.drr17_indicators_met + null_zeroed_row.drr17_indicators_not_met + null_zeroed_row.drr17_indicators_not_available,
              drr17_future_total: null_zeroed_row.drr17_indicators_future,
              drr17_total: null_zeroed_row.drr17_indicators_met + null_zeroed_row.drr17_indicators_not_met + null_zeroed_row.drr17_indicators_not_available + null_zeroed_row.drr17_indicators_future,
            };
          }
        );

        if (level === "summary"){
          ResultCounts.set_data(mapped_rows);
        } else if (level === "granular"){
          GranularResultCounts.set_data(mapped_rows);
        }
        api_is_results_count_loaded[level] = true;

        _.each( mapped_rows, ({id}) => _subject_has_results[id] = _.nonEmpty(mapped_rows) ); // side effect

        return Promise.resolve();
      })
      .catch(function(error){
        const resp_time = Date.now() - time_at_request;     
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_FAILURE",
          MISC2: `Results counts, took  ${resp_time} ms - ${error.toString()}`,
        });
        throw error;
      });
  }
}