import _ from "lodash";

import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "src/models/storeMixins";
import { trivial_text_maker } from "src/models/text";

class CovidMeasure extends mix().with(
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
    const inst = new CovidMeasure(measure);
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

export { CovidMeasure };
