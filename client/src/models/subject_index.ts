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

assign_to_dev_helper_namespace({
  Subject,
});
