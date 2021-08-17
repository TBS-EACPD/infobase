import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_static_store } from "src/models/utils/make_static_store";

type CovidMeasureDef = {
  id: string;
  name: string;
};

class CovidMeasure extends BaseSubjectFactory(
  "covid_measure",
  trivial_text_maker("covid_measure"),
  trivial_text_maker("covid_measures")
) {
  id: string;
  name: string;
  constructor(def: CovidMeasureDef) {
    super(def);

    this.id = def.id;
    this.name = def.name;
  }
}

const covidMeasureStore = make_static_store(
  (def: CovidMeasureDef) => new CovidMeasure(def)
);

export { CovidMeasure, covidMeasureStore };
