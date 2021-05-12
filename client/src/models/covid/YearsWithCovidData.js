import _ from "lodash";

import { mix, staticStoreMixin } from "src/models/storeMixins";

class YearsWithCovidData extends mix().with(staticStoreMixin) {
  static create_and_register(subject_id, years_with_covid_data) {
    const inst = new YearsWithCovidData(subject_id, years_with_covid_data);
    this.register(subject_id, inst);
    return inst;
  }
  constructor(subject_id, years_with_covid_data) {
    super();
    _.assign(this, {
      subject_id,
      ...years_with_covid_data,
    });
  }
}

export { YearsWithCovidData };
