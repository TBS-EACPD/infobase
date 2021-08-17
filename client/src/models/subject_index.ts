import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CovidMeasure } from "./covid/CovidMeasure";
import {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
} from "./organizational_entities";
import { Result, Indicator } from "./results";
import { Tag } from "./tags";

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

assign_to_dev_helper_namespace({
  Subject: {
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
  },
});
