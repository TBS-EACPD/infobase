import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "../storeMixins.js";
import { trivial_text_maker } from "../text.js";

class CovidInitiatives extends mix().with(
  staticStoreMixin,
  PluralSingular,
  SubjectMixin
) {
  static get subject_type() {
    return "covid_initiative";
  }
  static get singular() {
    return trivial_text_maker("covid_initiative");
  }
  static get plural() {
    return trivial_text_maker("covid_initiatives");
  }

  static create_and_register(initiative_and_estimates) {
    const inst = new CovidInitiatives(initiative_and_estimates);
    this.register(initiative_and_estimates.id, inst);
    return inst;
  }
  constructor(initiative_and_estimates) {
    super();
    _.assign(this, {
      ...initiative_and_estimates,
      org_ids: _.map(
        initiative_and_estimates.estimates,
        ({ org_id }) => org_id
      ),
    });
  }
}

export { CovidInitiatives };
