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

  const subject_class = _.chain(Subject)
    .values()
    .find({ subject_type: type })
    .value();

  if (subject_class) {
    // TODO temporary shim and loss of type safety until legacy Result and Indicator subjects ar ported to TS and the new Subject factory
    return _.has(subject_class, "store.lookup")
      ? (
          subject_class as
            | typeof Gov
            | typeof Dept
            | typeof CRSO
            | typeof Program
            | typeof InstForm
            | typeof Ministry
            | typeof Minister
            | typeof ProgramTag
        ).store.lookup(id)
      : (subject_class as typeof Result | typeof Indicator).lookup(id);
  }
};

assign_to_dev_helper_namespace({ Subject, get_subject_by_guid });
