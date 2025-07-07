import _ from "lodash";

import {
  promisedDeptRecipientReportYears,
  promisedGovRecipientReportYears,
} from "./queries";
import { RecipientReportYears } from "./RecipientsSummaryDataStore";

const _subject_ids_with_loaded_years_with_recipient_data = {};
export const api_load_years_with_recipient_data = (subject) => {
  const { is_loaded, subject_type, id, query } = (() => {
    const subject_is_loaded = (id) =>
      _.get(_subject_ids_with_loaded_years_with_recipient_data, id);

    switch (subject.subject_type) {
      case "dept":
        return {
          is_loaded: subject_is_loaded(subject.id),
          subject_type: "dept",
          id: String(subject.id),
          query: promisedDeptRecipientReportYears,
        };
      default:
        return {
          is_loaded: subject_is_loaded("gov"),
          subject_type: "gov",
          id: "gov",
          query: promisedGovRecipientReportYears,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  return query({ id }).then((response) => {
    RecipientReportYears.create_and_register({
      subject_id: id,
      report_years: response.years_with_recipient_data,
    });

    if (subject_type === "dept") {
      subject.set_has_data(
        "recipients",
        !_.chain(response)
          .thru(({ years_with_recipient_data }) => [
            ...years_with_recipient_data,
          ])
          .isEmpty()
          .value()
      );
    }

    _.setWith(
      _subject_ids_with_loaded_years_with_recipient_data,
      id,
      true,
      Object
    );
  });
};
