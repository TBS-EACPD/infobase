import _ from "lodash";

import { CovidMeasure } from "./CovidMeasure.js";
import {
  query_gov_years_with_covid_data,
  query_org_years_with_covid_data,
  query_all_covid_measures,
} from "./queries.js";
import { YearsWithCovidData } from "./YearsWithCovidData.js";

const _subject_ids_with_loaded_years_with_covid_data = {};
export const api_load_years_with_covid_data = (subject) => {
  const { is_loaded, level, id, query } = (() => {
    const subject_is_loaded = (id) =>
      _.get(_subject_ids_with_loaded_years_with_covid_data, id);

    switch (subject.level) {
      case "dept":
        return {
          is_loaded: subject_is_loaded(subject.id),
          level: "dept",
          id: subject.id,
          query: query_org_years_with_covid_data,
        };
      default:
        return {
          is_loaded: subject_is_loaded("gov"),
          level: "gov",
          id: "gov",
          query: query_gov_years_with_covid_data,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  return query({ id }).then((years_with_covid_data) => {
    YearsWithCovidData.create_and_register(id, years_with_covid_data);

    if (level === "dept") {
      subject.set_has_data(
        "covid",
        !_.chain(years_with_covid_data).flatMap().isEmpty().value()
      );
    }

    _.setWith(_subject_ids_with_loaded_years_with_covid_data, id, true, Object);
  });
};

const _loaded_measures = { loaded: false };
export const api_load_all_covid_measures = () => {
  if (_loaded_measures.loaded) {
    return Promise.resolve();
  }

  return query_all_covid_measures().then((covid_measures) => {
    _.each(covid_measures, (covid_measure) =>
      CovidMeasure.create_and_register(covid_measure)
    );

    _loaded_measures.loaded = true;

    return Promise.resolve();
  });
};
