import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { Result, Indicator } from "./results";
import {
  Gov,
  Dept,
  CRSO,
  Program,
  ProgramTag,
  Ministry,
  Minister,
  InstForm,
} from "./structure";

export {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
  ProgramTag,
  Result,
  Indicator,
};

export const Subject = {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
  ProgramTag,
  Result,
  Indicator,
};

export const get_subject_by_guid = (guid: string) => {
  const [type, id] = guid.split("_");

  const subject = _.chain(Subject)
    .values()
    .find({ subject_type: type })
    .value();

  if (subject) {
    // SUBJECT_TS_TODO temporary shim and loss of type safety until legacy Result and Indicator subjects ar ported to TS and the new Subject factory
    return _.has(subject, "store.lookup")
      ? (subject as any).store.lookup(id) // eslint-disable-line @typescript-eslint/no-explicit-any
      : (subject as any).lookup(id); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
};

assign_to_dev_helper_namespace({ Subject, get_subject_by_guid });
