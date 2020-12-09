import {
  mix,
  exstensibleStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "../storeMixins.js";
import { trivial_text_maker } from "../text.js";

class CovidMeasures extends mix().with(
  exstensibleStoreMixin,
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
  static extend_with_estimates(measure_id, estimates) {
    const measure = this.lookup(measure_id);
    const new_estimates_set =
      measure && measure.estimates
        ? _.uniqBy(
            [...estimates, ...measure.estimates],
            ({ org_id, fiscal_year, est_doc }) =>
              `${org_id}-${fiscal_year}-${est_doc}`
          )
        : estimates;

    this.extend(measure_id, { estimates: new_estimates_set });
  }
}

export { CovidMeasures };
