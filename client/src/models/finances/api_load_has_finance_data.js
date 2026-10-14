import _ from "lodash";

import { log_standard_event } from "src/core/analytics";

import { promisedDeptHasFinanceData } from "./queries";
import {
  promisedCrsoHasFinanceData,
  promisedGovHasFinanceData,
  promisedProgramHasFinanceData,
} from "./queries/slices";

const has_data_is_loaded = (subject) => {
  try {
    subject.has_data("finance_data");
  } catch (error) {
    return false;
  }
  return true;
};

export const api_load_has_finance_data = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, query, variables } = (() => {
    switch (subject_type) {
      case "dept":
        return {
          is_loaded: has_data_is_loaded(subject),
          query: promisedDeptHasFinanceData,
          variables: { org_id: String(subject.id) },
        };
      case "program":
        return {
          is_loaded: has_data_is_loaded(subject),
          query: promisedProgramHasFinanceData,
          variables: { program_id: subject.id },
        };
      case "crso":
        return {
          is_loaded: has_data_is_loaded(subject),
          query: promisedCrsoHasFinanceData,
          variables: { crso_id: subject.id },
        };
      case "gov":
        return {
          is_loaded: has_data_is_loaded(subject),
          query: promisedGovHasFinanceData,
          variables: {},
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
  return query(variables)
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
