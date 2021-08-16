import _ from "lodash";

import { StaticStoreFactory } from "src/models/storeMixins";

type YearsWithCovidDataDef = {
  subject_id: string;
  years_with_covid_data: {
    years_with_estimates: number[];
    years_with_expenditures: number[];
  };
};

class YearsWithCovidData {
  id: string;
  subject_id: string;
  years_with_estimates: number[];
  years_with_expenditures: number[];

  constructor({
    subject_id,
    years_with_covid_data: { years_with_estimates, years_with_expenditures },
  }: YearsWithCovidDataDef) {
    this.id = subject_id;
    this.subject_id = subject_id;
    this.years_with_estimates = years_with_estimates;
    this.years_with_expenditures = years_with_expenditures;
  }
}

export const yearsWithCovidDataStore = StaticStoreFactory<
  YearsWithCovidDataDef,
  YearsWithCovidData
>((def: YearsWithCovidDataDef) => new YearsWithCovidData(def));
