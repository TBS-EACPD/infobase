import _ from "lodash";

import { log_standard_event } from "src/core/analytics";

import { promisedDeptHasFinanceData } from "./queries";

export const api_load_has_finance_data = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, id, query } = (() => {
    const has_finance_data_is_loaded = (() => {
      try {
        subject.has_data("finance_data");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (subject_type) {
      case "dept":
        return {
          is_loaded: has_finance_data_is_loaded,
          id: String(subject.id),
          query: promisedDeptHasFinanceData,
        };
      default:
        return {
          is_loaded: true,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  return query({ org_id: id })
    .then((response) => {
      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response)) {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Has finance_data, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has finance_data, took ${resp_time} ms`,
        });
      }
      subject.set_has_data("finance_data", response?.has_finance_data);

      return Promise.resolve();
    })
    .catch(function (error) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has finance_data, took ${time_at_request} ms - ${error.toString()}`,
      });
      throw error;
    });
};
