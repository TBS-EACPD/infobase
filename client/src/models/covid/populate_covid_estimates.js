import gql from "graphql-tag";

import { log_standard_event } from "../../core/analytics.js";
import { get_client } from "../../graphql_utils/graphql_utils.js";

import { CovidEstimates } from "./CovidEstimates.js";

const covid_estimates_query_fragment = `
  covid_estimates {
    id
    
    org_id
    
    fiscal_year
    est_doc
    vote
    stat
  }
`;

const get_org_covid_estimates_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${covid_estimates_query_fragment}
      }
    }
  }
`;
const get_gov_covid_estimates_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_estimates_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_estimates = {};
export const api_load_covid_estimates = (subject) => {
  const level = (subject && subject.level) || "gov";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_estimates, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "gov", id: "gov" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: get_org_covid_estimates_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded,
          id: "gov",
          query: get_gov_covid_estimates_query,
          response_data_accessor: (response) => response.data.root.gov,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query,
      variables: {
        lang: window.lang,
        id,
        _query_name: "covid_estimates",
      },
    })
    .then((response) => {
      const { covid_estimates } = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_estimates)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid estimates, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid estimates, took ${resp_time} ms`,
        });
      }

      _.each(covid_estimates, (covid_estimates_row) =>
        CovidEstimates.create_and_register(covid_estimates_row)
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_estimates,
        `${level}.${id}`,
        true,
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid estimates, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
