import gql from "graphql-tag";

import { log_standard_event } from "../../core/analytics.js";
import { get_client } from "../../graphql_utils/graphql_utils.js";

import { CovidInitiatives } from "./CovidInitiatives.js";

const covid_initiative_query_fragment = `
  covid_initiatives {
    id
    name
    
    estimates {
      org_id
    
      covid_measure_ids
      covid_measures {
        id
        name
      }
    
      fiscal_year
      est_doc
      vote
      stat
    }
  }
`;

const get_org_covid_initiative_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id	
        ${covid_initiative_query_fragment}
      }
    }
  }
`;
const get_gov_covid_initiative_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_initiative_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_initiatives = {};
export const api_load_covid_initiatives = (subject) => {
  const level = (subject && subject.level) || "gov";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_initiatives, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "gov", id: "gov" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: get_org_covid_initiative_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded,
          id: "gov",
          query: get_gov_covid_initiative_query,
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
        _query_name: "covid_initiatives",
      },
    })
    .then((response) => {
      const response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response_data)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid initiatives, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid initiatives, took ${resp_time} ms`,
        });
      }

      if (!_.isEmpty(response)) {
        _.each(
          response,
          (initiative_and_estimates) =>
            CovidInitiatives.lookup(initiative_and_estimates.id) ||
            CovidInitiatives.create_and_register(initiative_and_estimates)
        );
      }

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_initiatives,
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
        MISC2: `Covid initiatives, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
