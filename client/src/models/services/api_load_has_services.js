import _ from "lodash";

import { log_standard_event } from "src/core/analytics";

import {
  promisedDeptHasServices,
  promisedProgramHasServices,
} from "./services_queries";

export const api_load_has_services = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, id, query } = (() => {
    const has_services_is_loaded = (() => {
      try {
        subject.has_data("services");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (subject_type) {
      case "dept":
        return {
          is_loaded: has_services_is_loaded,
          id: String(subject.id),
          query: promisedDeptHasServices,
        };
      case "program":
        return {
          is_loaded: has_services_is_loaded,
          id: String(subject.id),
          query: promisedProgramHasServices,
        };
      default:
        return {
          is_loaded: true, // no default case, this is to resolve the promise early
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  return query({ id })
    .then((response) => {
      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      }
      subject.set_has_data("services", response[`has_services`]);

      return Promise.resolve();
    })
    .catch(function (error) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has services, took ${time_at_request} ms - ${error.toString()}`,
      });
      throw error;
    });
};
