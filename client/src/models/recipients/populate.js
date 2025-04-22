import _ from "lodash";

import { log_standard_event } from "src/core/analytics";

import {
  promisedDeptHasRecipients,
  promisedRecipientsGeneralStats,
} from "./queries";
import { RecipientsGeneralStatsDataStore } from "./RecipientsGeneralStatsDataStore";

export const api_load_has_recipients = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, id, query } = (() => {
    const has_recipients_is_loaded = (() => {
      try {
        subject.has_data("recipients");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (subject_type) {
      case "dept":
        return {
          is_loaded: has_recipients_is_loaded,
          id: String(subject.id),
          query: promisedDeptHasRecipients,
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
          MISC2: `Has recipients, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has recipients, took ${resp_time} ms`,
        });
      }
      subject.set_has_data("recipients", response[`has_recipients`]);

      return Promise.resolve();
    })
    .catch(function (error) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has recipients, took ${time_at_request} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const _subject_ids_with_loaded_recipients_general_stats_data = {};
export const api_load_recipients_general_stats_data = (subject) => {
  const { is_loaded, subject_type, id, query } = (() => {
    const subject_is_loaded = (id) =>
      _.get(_subject_ids_with_loaded_recipients_general_stats_data, id);

    switch (subject.subject_type) {
      case "dept":
        return {
          is_loaded: subject_is_loaded(subject.id),
          subject_type: "dept",
          id: String(subject.id),
          query: promisedRecipientsGeneralStats,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  return query({ id }).then((response) => {
    RecipientsGeneralStatsDataStore.create_and_register({
      subject_id: id,
      data: response,
    });

    if (subject_type === "dept") {
      subject.set_has_data(
        "recipients",
        !_.chain(response)
          .thru(
            ({ year, org_id, recipient, total_exp, num_transfer_payments }) => [
              year,
              org_id,
              recipient,
              total_exp,
              num_transfer_payments,
            ]
          )
          .isEmpty()
          .value()
      );
    }

    _.setWith(
      _subject_ids_with_loaded_recipients_general_stats_data,
      id,
      true,
      Object
    );
  });
};
