import { mix, staticStoreMixin } from "../storeMixins.js";

const id_from_row = ({ org_id, fiscal_year, est_doc }) =>
  `${org_id}-${fiscal_year}-${est_doc}`;

class CovidEstimates extends mix().with(staticStoreMixin) {
  static create_and_register(covid_estimates_row) {
    const inst = new CovidEstimates(covid_estimates_row);
    this.register(id_from_row(covid_estimates_row), inst);
    return inst;
  }
  constructor(covid_estimates_row) {
    super();
    _.assign(this, {
      id: id_from_row(covid_estimates_row),
      ...covid_estimates_row,
    });
  }
}

export { CovidEstimates };
