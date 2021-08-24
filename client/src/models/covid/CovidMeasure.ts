import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

type CovidMeasureDef = {
  id: string;
  name: string;
};

class CovidMeasure extends BaseSubjectFactory(
  "covid_measure",
  trivial_text_maker("covid_measure"),
  trivial_text_maker("covid_measures")
) {
  static lookup = make_store((def: CovidMeasureDef) => new CovidMeasure(def));

  id: string;
  name: string;
  constructor(def: CovidMeasureDef) {
    super(def);

    this.id = def.id;
    this.name = def.name;
  }
}

export { CovidMeasure };
