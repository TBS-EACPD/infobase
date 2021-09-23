import _ from "lodash";

import { Subject } from "src/models/subject_index";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

// SUBJECT_TS_TODO move this in to subject_index.ts Result and Indicator are properly typed

export const get_subject_by_guid = (guid) => {
  const [type, id] = guid.split("_");

  const subject = _.chain(Subject)
    .values()
    .find(({ subject_type }) => subject_type === type)
    .value();

  return (
    subject &&
    (_.has(subject, "store.lookup")
      ? subject.store.lookup(id)
      : subject.lookup(id)) // SUBJECT_TS_TODO shim for Result and Indicator subjects
  );
};

assign_to_dev_helper_namespace({
  Subject,
  get_subject_by_guid,
});
