import { get_client } from '../graphql_utils.js';
import gql from 'graphql-tag';
import { log_standard_event } from '../core/analytics.js';
import { 
  Service, 
  ServiceStandard, 
} from './services.js';


const get_dept_services_query = (years_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      org_id
      ${_.map(years_to_load,
          year => `
            services()
            service_id
            program_ids
            year: String
            is_active: Boolean

            name: String
            description: String
            service_type: [String]
            scope: [String]
            target_groups: [String]
            feedback_channels: [String]
            urls: [String]
            comment: String

            last_gender_analysis: String

            collects_fees: Boolean
            cra_buisnss_number_is_identifier: Boolean
            sin_is_identifier: Boolean
            account_reg_digital_status: Boolean
            authentication_status: Boolean
            application_digital_status: Boolean
            decision_digital_status: Boolean
            issuance_digital_status: Boolean
            issue_res_digital_status: Boolean
            digital_enablement_comment: String

            telephone_enquires: Float
            website_visits: Float
            online_applications: Float
            in_person_applications: Float
            mail_applications: Float
            other_channel_applications: Float

            standards: [ServiceStandard]
            `
        )}
      ${program_results_fragment(docs_to_load)}
    }
  }
}

const get_services_query = (level, id_arg_name, years_to_load) => gql`
query($lang: String! ${id_arg_name ? `, $id: String` : ''}) {
  root(lang: $lang) {
    ${level}${id_arg_name ? `(${id_arg_name}: $id)` : ''} {
    id
  ${_.map(
    years_to_load,
    budget_year => `
      measures${budget_year}: budget_measures(year: ${_.toInteger(budget_year)}){
        measure_id
        name
        chapter_key
        section_id
        description
        data {
          unique_id
          org_id
          measure_id
          description
          funding
          allocated
          remaining
          withheld
          program_allocations {
            unique_id
            subject_id
            measure_id
            allocated
          }
          submeasure_breakouts {
            unique_id
            submeasure_id
            name
            org_id
            parent_measure_id
            allocated
            withheld
            program_allocations {
              unique_id
              subject_id
              measure_id
              allocated
            }
          }
        }
      }`
  )}
    }
  }
}
`;
const _subject_ids_with_loaded_measures = {};
export function api_load_budget_measures(subject, years){
  const years_to_load = !_.isEmpty(years) ? years : budget_years;

  const level = (subject && subject.level) || 'gov';

  const {
    is_loaded,
    id,
    query,
    response_data_accessor,
  } = (() => {
    const subject_is_loaded = ({level, id}) => _.every(
      years_to_load,
      year => _.get(_subject_ids_with_loaded_measures, `${year}.${level}.${id}`)
    );

    const all_is_loaded = () => subject_is_loaded({level: 'gov', id: 'gov'});
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);
    const crso_is_loaded = (crso) => dept_is_loaded(crso.dept) || subject_is_loaded(crso);
    const program_is_loaded = (program) => crso_is_loaded(program.crso) || subject_is_loaded(program);

    switch(level){
      case 'program':
        return {
          is_loaded: program_is_loaded(subject),
          id: subject.id,
          query: get_budget_measures_query('program', 'id', years_to_load),
          response_data_accessor: (response) => response.data.root.program,
        };
      case 'crso':
        return {
          is_loaded: crso_is_loaded(subject),
          id: subject.id,
          query: get_budget_measures_query('crso', 'id', years_to_load),
          response_data_accessor: (response) => response.data.root.crso,
        };
      case 'dept':
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: get_budget_measures_query('org', 'org_id', years_to_load),
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(subject),
          id: 'gov',
          query: get_budget_measures_query('gov', false, years_to_load),
          response_data_accessor: (response) => response.data.root.gov,
        };
    }
  })();

  if (is_loaded){
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client.query({
    query,
    variables: {
      lang: window.lang, 
      id,
      _query_name: 'budget_measures',
    },
  })
    .then( (response) => {
      const response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request; 
      if( !_.isEmpty(response_data) ){
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Budget measures, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Budget measures, took ${resp_time} ms`,
        });  
      }

      _.each(
        years_to_load,
        year => {
          const measures_in_year = response_data[`measures${year}`];

          if ( !_.isEmpty(measures_in_year) ){
            _.each(
              measures_in_year,
              measure => BudgetMeasure.create_and_register({...measure, year}),
            );
          }

          // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
          // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
          _.setWith(
            _subject_ids_with_loaded_measures,
            `${year}.${level}.${id}`,
            true,
            Object
          );

          // side effect
          _.setWith(
            _subject_has_measures, 
            `${year}.${level}.${id}`, 
            _.isEmpty(measures_in_year),
            Object
          );
        }
      );

      return Promise.resolve();
    })
    .catch(function(error){
      const resp_time = Date.now() - time_at_request;     
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Budget measures, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
}