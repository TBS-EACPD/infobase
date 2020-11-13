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
)() {
  static get subject_type() {
    return "covid_measure";
  }
  static get singular() {
    return trivial_text_maker("covid_measure");
  }
  static get plural() {
    return trivial_text_maker("covid_measures");
  }

  static create_and_register(id, name) {
    const inst = new CovidMeasures(id, name);
    this.register(id, inst);
    return inst;
  }
  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
  }
}

export { CovidMeasures };
