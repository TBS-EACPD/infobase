import _ from "src/app_bootstrap/lodash_mixins.js";

import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "../storeMixins.js";
import { trivial_text_maker } from "../text.js";

class CovidMeasures extends mix().with(
  staticStoreMixin,
  PluralSingular,
  SubjectMixin
) {
  static get subject_type() {
    return "covid_measure";
  }
  static get singular() {
    return trivial_text_maker("covid_measure");
  }
  static get plural() {
    return trivial_text_maker("covid_measures");
  }

  static create_and_register(measure) {
    const inst = new CovidMeasures(measure);
    this.register(measure.id, inst);
    return inst;
  }
  constructor(measure) {
    super();
    _.assign(this, {
      ...measure,
    });
  }
}

export { CovidMeasures };
