import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";
import { Gov } from "./Gov";

import { Program, ProgramTag } from "./Program";

export { Gov, Dept, CRSO, Program, ProgramTag };

export const Subject = {
  Gov,
  Dept,
  CRSO,
  Program,
  ProgramTag,
};

export const get_subject_by_guid = (guid: string) => {
  const [type, id] = guid.split("_");

  const subject_class = _.chain(Subject)
    .values()
    .find({ subject_type: type })
    .value();

  if (subject_class) {
    return subject_class.store.lookup(id);
  }
};

assign_to_dev_helper_namespace({ Subject, get_subject_by_guid });
