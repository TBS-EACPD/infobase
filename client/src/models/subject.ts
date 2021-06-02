import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CovidMeasure } from "./covid/CovidMeasure";
import { YearsWithCovidData } from "./covid/YearsWithCovidData";
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

const Subject: {
  [key: string]:
    | typeof Gov
    | typeof Dept
    | typeof CRSO
    | typeof Program
    | typeof InstForm
    | typeof Ministry
    | typeof Minister
    | typeof Tag
    | typeof Result
    | typeof Indicator
    | typeof CovidMeasure
    | typeof YearsWithCovidData
    | ((guid: string) => any);
} = {
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
  YearsWithCovidData,
  get_by_guid: (guid: string) => {
    if (!_.isString(guid)) {
      return null;
    }
    let [model_type, model_id] = guid.split("_");
    return Subject[model_type] && (Subject[model_type] as any).lookup(model_id);
  },
};

// Duplicate keys in all lower case, for legacy reasons
_.each(Subject, (subject_item, key) => {
  const lower_case_key = _.toLower(key);
  if (_.chain(Subject).keys().indexOf(lower_case_key).value() === -1) {
    Subject[lower_case_key] = subject_item;
  }
});

assign_to_dev_helper_namespace({ Subject });

export { Subject };
