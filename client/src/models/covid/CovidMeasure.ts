import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

// SUBJECT_TS_TODO does this _really_ need to be a subject? Maybe make it a plain store

type CovidMeasureDef = {
  id: string;
  name: string;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface CovidMeasure extends CovidMeasureDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class CovidMeasure extends BaseSubjectFactory<CovidMeasureDef>(
  "covid_measure",
  trivial_text_maker("covid_measures")
) {
  static store = make_store((def: CovidMeasureDef) => new CovidMeasure(def));
}
