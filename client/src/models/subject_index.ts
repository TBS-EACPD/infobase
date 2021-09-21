import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CovidMeasure } from "./covid/CovidMeasure";
import {
  Dept,
  CRSO,
  Program,
  InstForm,
  Minister,
} from "./organizational_entities";
import { Result, Indicator } from "./results";
import { Tag } from "./results/Tag";
import { Gov, Ministry } from "./structure";

export {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
  Tag,
  Result,
  Indicator,
  CovidMeasure,
};

export const Subject = {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
  Tag,
  Result,
  Indicator,
  CovidMeasure,
};

assign_to_dev_helper_namespace({
  Subject,
});
