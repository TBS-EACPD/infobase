import { lang } from "src/app_bootstrap/globals.js";

import { businessConstants } from "../businessConstants.js";
import { Dept } from "../organizational_entities.js";
import { mix, staticStoreMixin } from "../storeMixins.js";

class CovidEstimates extends mix().with(staticStoreMixin) {
  static create_and_register(covid_estimates_row) {
    const inst = new CovidEstimates(covid_estimates_row);
    this.register(covid_estimates_row.id, inst);
    return inst;
  }
  constructor(covid_estimates_row) {
    super();
    _.assign(this, covid_estimates_row);
  }

  static get_gov_summary() {
    return _.filter(
      super.get_all(),
      ({ org_id: row_org_id }) => row_org_id === "gov"
    );
  }

  static get_all() {
    return _.filter(
      super.get_all(),
      ({ org_id: row_org_id }) => row_org_id !== "gov"
    );
  }

  static org_lookup(org_id) {
    return _.filter(
      CovidEstimates.get_all(),
      ({ org_id: row_org_id }) => row_org_id === org_id
    );
  }

  get org() {
    return Dept.lookup(this.org_id);
  }

  get doc_name() {
    return businessConstants.estimates_docs[this.est_doc][lang];
  }
}

export { CovidEstimates };
