import gql from "graphql-tag";

import _ from "lodash";

import { lang } from "src/core/injected_build_constants.js";

import { log_standard_event } from "../../core/analytics.js";
import { get_client } from "../../graphql_utils/graphql_utils.js";

import { CovidEstimates } from "./CovidEstimates.js";
import { CovidInitiatives } from "./CovidInitiatives.js";
import { CovidMeasures } from "./CovidMeasures.js";

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

const org_covid_estimates_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${covid_estimates_query_fragment}
      }
    }
  }
`;
const all_covid_estimates_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_estimates_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_estimates = {};
export const api_load_covid_estimates = (subject) => {
  const level = subject && subject.level == "dept" ? "dept" : "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_estimates, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: org_covid_estimates_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: all_covid_estimates_query,
          response_data_accessor: (response) => response.data.root,
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
        lang: lang,
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

const covid_estimates_gov_summary_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      gov {
        id
        covid_estimates_summary {
          id

          fiscal_year
          est_doc
          vote
          stat
        }
      }
    }
  }
`;

export const api_load_covid_estimates_gov_summary = () => {
  if (!_.isEmpty(CovidEstimates.get_gov_summary())) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query: covid_estimates_gov_summary_query,
      variables: {
        lang: lang,
        _query_name: "covid_estimates_gov_summary",
      },
    })
    .then((response) => {
      const { covid_estimates_summary } = response.data.root.gov;

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_estimates_summary)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid estimates gov summary, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid estimates gov summary, took ${resp_time} ms`,
        });
      }

      _.each(covid_estimates_summary, (covid_estimates_summary_rows) =>
        CovidEstimates.create_and_register({
          org_id: "gov",
          ...covid_estimates_summary_rows,
        })
      );

      return covid_estimates_summary;
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid estimates gov summary, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const covid_initiative_query_fragment = `
  covid_initiatives {
    id
    name
    
    estimates {
      id
      
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

const org_covid_initiative_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${covid_initiative_query_fragment}
      }
    }
  }
`;
const gov_covid_initiative_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_initiative_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_initiatives = {};
export const api_load_covid_initiatives = (subject) => {
  const level = (subject && subject.level === "dept") || "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_initiatives, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: org_covid_initiative_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: gov_covid_initiative_query,
          response_data_accessor: (response) => response.data.root,
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
        lang: lang,
        id,
        _query_name: "covid_initiatives",
      },
    })
    .then((response) => {
      const { covid_initiatives } = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_initiatives)) {
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

      _.each(
        covid_initiatives,
        (initiative_and_estimates) =>
          CovidInitiatives.lookup(initiative_and_estimates.id) ||
          CovidInitiatives.create_and_register(initiative_and_estimates)
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_initiatives,
        `${level}.${id}`,
        true,
        Object
      );

      // TODO: as applicable, roll up initiative level estimates to populate the CovidEstimates using this same data, update _subject_ids_with_loaded_estimates
      // ... hmm, if I get rid of the need to have _subject_ids_with_loaded_estimates in both scopes then I could split these back out in to their own modules

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

const covid_measures_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      covid_measures {
        id
        name
      }
    }
  }
`;

export const api_load_covid_measures = () => {
  if (!_.isEmpty(CovidMeasures.get_all())) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      covid_measures_query,
      variables: {
        lang: lang,
        _query_name: "covid_measures",
      },
    })
    .then((response) => {
      const covid_measures = response.data.root.covid_measures;

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_measures)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      }

      _.each(covid_measures, (measure) =>
        CovidMeasures.create_and_register(measure)
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid measures, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
