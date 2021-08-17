import _ from "lodash";

import * as Subject from "./subject_index";

// SUBJECT_TS_TODO this pattern will break as subjects and stores are separated
// (unless I decide to recombine them, in which case I'll need to work out typing here)

export const get_subject_by_guid = (guid) => {
  if (!_.isString(guid)) {
    return null;
  }
  const [type, id] = guid.split("_");

  const subject = _.pickBy(Subject, (subject) => subject.subject_type === type);

  return subject?.lookup(id);
};
