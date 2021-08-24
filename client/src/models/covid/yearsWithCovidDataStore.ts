import _ from "lodash";

import { make_store } from "src/models/utils/make_store";

type YearsWithCovidDataDef = {
  subject_id: string;
  years_with_covid_data: {
    years_with_estimates: number[];
    years_with_expenditures: number[];
  };
};

export const yearsWithCovidDataStore = make_store(
  ({ subject_id, years_with_covid_data }: YearsWithCovidDataDef) => ({
    id: subject_id,
    subject_id,
    ...years_with_covid_data,
  })
);
