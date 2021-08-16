import _ from "lodash";

import { StaticStoreFactory } from "src/models/storeMixins";

type YearsWithCovidDataDef = {
  subject_id: string;
  years_with_covid_data: {
    years_with_estimates: number[];
    years_with_expenditures: number[];
  };
};

type YearsWithCovidDataInst = {
  id: string;
  subject_id: string;
  years_with_estimates: number[];
  years_with_expenditures: number[];
};

export const yearsWithCovidDataStore = StaticStoreFactory<
  YearsWithCovidDataDef,
  YearsWithCovidDataInst
>(({ subject_id, years_with_covid_data }: YearsWithCovidDataDef) => ({
  id: subject_id,
  subject_id,
  ...years_with_covid_data,
}));
