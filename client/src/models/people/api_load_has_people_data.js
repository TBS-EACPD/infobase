import _ from "lodash";

import { log_standard_event } from "src/core/analytics";

import { promisedDeptHasPeopleData } from "./queries";

export const api_load_has_people_data = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, id, query } = (() => {
    const has_people_data_is_loaded = (() => {
      try {
        subject.has_data("people_data");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (subject_type) {
      case "dept":
        return {
          is_loaded: has_people_data_is_loaded,
          id: String(subject.id),
          query: promisedDeptHasPeopleData,
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
          MISC2: `Has people_data, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has people_data, took ${resp_time} ms`,
        });
      }
      subject.set_has_data("people_data", response[`has_people_data`]);

      return Promise.resolve();
    })
    .catch(function (error) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has people_data, took ${time_at_request} ms - ${error.toString()}`,
      });
      throw error;
    });
};
