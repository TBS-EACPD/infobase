import _ from "lodash";

import { log_standard_event } from "src/core/analytics.js";
import { lang } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { CovidMeasure } from "./CovidMeasure.js";
import {
  org_has_covid_data_query,
  org_covid_measure_query,
  all_covid_measure_query,
  org_covid_estimates_by_measure_query,
  all_covid_estimates_by_measure_query,
  org_covid_expenditures_by_measure_query,
  all_covid_expenditures_by_measure_query,
  org_covid_commitments_by_measure_query,
  all_covid_commitments_by_measure_query,
} from "./queries.js";

export const api_load_has_covid_response = (subject) => {
  if (!(subject && subject.level === "dept")) {
    return Promise.resolve();
  }

  try {
    subject.has_data("covid_response");
  } catch (e) {
    return get_client()
      .query({
        query: org_has_covid_data_query,
        variables: {
          lang: window.lang,
          id: subject.id,
          _query_name: "has_covid_response",
        },
      })
      .then((response) =>
        subject.set_has_data(
          "covid_response",
          response.data.root.org.has_covid_data || false
        )
      );
  }

  return Promise.resolve();
};

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
          query: org_covid_measure_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: all_covid_measure_query,
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
          CovidMeasure.lookup(covid_measure.id) ||
          CovidMeasure.create_and_register(covid_measure)
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
          if (!CovidMeasure.lookup(covid_measure.id)) {
            CovidMeasure.create_and_register(covid_measure);
          }

          CovidMeasure.extend_with_data(
            covid_measure.id,
            "estimates",
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

const _subject_ids_with_loaded_expenditures_by_measure = {};
export const api_load_covid_expenditures_by_measure = (subject) => {
  const level = subject && subject.level === "dept" ? "dept" : "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_expenditures_by_measure, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: org_covid_expenditures_by_measure_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: all_covid_expenditures_by_measure_query,
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
        lang: window.lang,
        id,
        _query_name: "covid_expenditures_by_measure",
      },
    })
    .then((response) => {
      const { covid_expenditures_by_measure } = response_data_accessor(
        response
      );

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_expenditures_by_measure)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid expenditures by measure, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid expenditures by measure, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_expenditures_by_measure,
        ({ covid_expenditures, ...covid_measure }) => {
          if (!CovidMeasure.lookup(covid_measure.id)) {
            CovidMeasure.create_and_register(covid_measure);
          }

          CovidMeasure.extend_with_data(
            covid_measure.id,
            "expenditures",
            covid_expenditures
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
        _subject_ids_with_loaded_expenditures_by_measure,
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
        MISC2: `Covid expenditures by measure, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const _subject_ids_with_loaded_commitments_by_measure = {};
export const api_load_covid_commitments_by_measure = (subject) => {
  const level = subject && subject.level === "dept" ? "dept" : "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_commitments_by_measure, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: org_covid_commitments_by_measure_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: all_covid_commitments_by_measure_query,
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
        lang: window.lang,
        id,
        _query_name: "covid_commitments_by_measure",
      },
    })
    .then((response) => {
      const { covid_commitments_by_measure } = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_commitments_by_measure)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid commitments by measure, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid commitments by measure, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_commitments_by_measure,
        ({ covid_commitments, ...covid_measure }) => {
          if (!CovidMeasure.lookup(covid_measure.id)) {
            CovidMeasure.create_and_register(covid_measure);
          }

          CovidMeasure.extend_with_data(
            covid_measure.id,
            "commitments",
            covid_commitments
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
        _subject_ids_with_loaded_commitments_by_measure,
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
        MISC2: `Covid commitments by measure, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
