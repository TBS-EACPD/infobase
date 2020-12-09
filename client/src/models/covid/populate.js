import { gql } from "@apollo/client";

import _ from "lodash";

import { log_standard_event } from "src/core/analytics.js";
import { lang } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { CovidMeasures } from "./CovidMeasures.js";

const org_has_covid_data_query = `
query ($lang: String!, $id: String!) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      has_covid_data
    }
  }
}`;
export const api_load_has_covid_response = (subject) => {
  if (!(subject && subject.level === "dept")) {
    return Promise.resolve();
  }

  try {
    subject.has_data("covid_response");
  } catch (e) {
    return get_client()
      .query({
        org_has_covid_data_query,
        variables: {
          lang: window.lang,
          id: subject.id,
          _query_name: "has_covid_response",
        },
      })
      .then((response) =>
        subject.set_has_data(
          "covid_repsonse",
          response.data.root.org.has_covid_data
        )
      );
  }

  return Promise.resolve();
};

const covid_measure_query_fragment = `
  covid_measures {
    id
    name
  }
`;

const org_covid_initiative_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${covid_measure_query_fragment}
      }
    }
  }
`;
const gov_covid_initiative_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_measure_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_measures = {};
export const api_load_covid_measures = (subject) => {
  const level = (subject && subject.level === "dept") || "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_measures, `${level}.${id}`);

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
        _query_name: "covid_measures",
      },
    })
    .then((response) => {
      const { covid_measures } = response_data_accessor(response);

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

      _.each(
        covid_measures,
        (covid_measure) =>
          CovidMeasures.lookup(covid_measure.id) ||
          CovidMeasures.create_and_register(covid_measure)
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_measures,
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
        MISC2: `Covid measures, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const covid_estimates_by_measure_query_fragment = `
  covid_measures {
    id
    name
  
    covid_estimates {
      org_id
      fiscal_year
      est_doc

      vote
      stat
    }
  }
`;

const org_covid_estimates_by_measure_query = gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${covid_estimates_by_measure_query_fragment}
      }
    }
  }
`;
const all_covid_estimates_by_measure_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_estimates_by_measure_query_fragment}
    }	
  }	
`;

const _subject_ids_with_loaded_estimates_by_measure = {};
export const api_load_covid_estimates_by_measure = (subject) => {
  const level = subject && subject.level === "dept" ? "dept" : "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_estimates_by_measure, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: org_covid_estimates_by_measure_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: all_covid_estimates_by_measure_query,
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
        _query_name: "covid_estimates_by_measure",
      },
    })
    .then((response) => {
      const { covid_estimates_by_measure } = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_estimates_by_measure)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid estimates by measure, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid estimates by measure, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_estimates_by_measure,
        ({ covid_estimates, ...covid_measure }) => {
          if (!CovidMeasures.lookup(covid_measure.id)) {
            CovidMeasures.create_and_register(covid_measure);
          }

          CovidMeasures.extend_with_estimates(
            covid_measure.id,
            covid_estimates
          );
        }
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_measures,
        `${level}.${id}`,
        true,
        Object
      );

      _.setWith(
        _subject_ids_with_loaded_estimates_by_measure,
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
        MISC2: `Covid estimates by measure, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
