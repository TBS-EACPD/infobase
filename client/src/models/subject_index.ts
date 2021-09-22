import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CovidMeasure } from "./covid/CovidMeasure";
import { CRSO, Program } from "./organizational_entities";
import { Result, Indicator } from "./results";
import { Tag } from "./results/Tag";
import { Gov, Dept, Ministry, Minister, InstForm } from "./structure";

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
