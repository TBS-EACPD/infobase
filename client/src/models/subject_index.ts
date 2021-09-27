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
    .find((subject) => {
      if (!("subject_type" in subject)) {
        // SUBJECT_TS_TODO type guard for, theoretically, unreachable case. Should be removable once Result and Indicator are updated and in TS
        throw new Error(
          "A Subject was missing the subject_type property. This SHOULD be a temporary and unreachable type guard that can be cleaned up once Result and Indicator are modernized"
        );
      }
      return subject.subject_type === type;
    })
    .value();

  if (subject) {
    if ("store" in subject) {
      subject.store.lookup(id);
    } else {
      // SUBJECT_TS_TODO shim for legacy Result and Indicator subjects
      return subject.lookup(id);
    }
  }
};

assign_to_dev_helper_namespace({ Subject, get_subject_by_guid });
