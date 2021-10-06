import _ from "lodash";

import { Gov } from "src/models/subjects/Gov";

import { CovidMeasureStore } from "./CovidMeasureStore";
import {
  query_gov_years_with_covid_data,
  query_org_years_with_covid_data,
  query_all_covid_measures,
} from "./queries";
import { yearsWithCovidDataStore } from "./yearsWithCovidDataStore";

const _subject_ids_with_loaded_years_with_covid_data = {};
export const api_load_years_with_covid_data = (subject) => {
  const { is_loaded, subject_type, id, query } = (() => {
    const subject_is_loaded = (id) =>
      _.get(_subject_ids_with_loaded_years_with_covid_data, id);

    switch (subject.subject_type) {
      case "dept":
        return {
          is_loaded: subject_is_loaded(subject.id),
          subject_type: "dept",
          id: String(subject.id),
          query: query_org_years_with_covid_data,
        };
      default:
        return {
          is_loaded: subject_is_loaded("gov"),
          subject_type: "gov",
          id: "gov",
          query: query_gov_years_with_covid_data,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  return (
    query({ org_id: String(id) })
      .then((years_with_covid_data) => {
        yearsWithCovidDataStore.create_and_register({
          subject_id: id,
          years_with_covid_data,
        });

        if (subject_type === "dept") {
          subject.set_has_data(
            "covid",
            !_.chain(years_with_covid_data)
              .thru(({ years_with_estimates, years_with_expenditures }) => [
                ...years_with_estimates,
                ...years_with_expenditures,
              ])
              .isEmpty()
              .value()
          );
        }

        _.setWith(
          _subject_ids_with_loaded_years_with_covid_data,
          id,
          true,
          Object
        );
      })
      // always want to make sure the gov years are also loaded, when loading for a specific dept
      .then(() => subject_type !== "gov" && api_load_years_with_covid_data(Gov))
  );
};

const _loaded_measures = { loaded: false };
export const api_load_all_covid_measures = () => {
  if (_loaded_measures.loaded) {
    return Promise.resolve();
  }

  return query_all_covid_measures().then((covid_measures) => {
    _.each(covid_measures, (covid_measure) =>
      CovidMeasureStore.create_and_register(covid_measure)
    );

    _loaded_measures.loaded = true;

    return Promise.resolve();
  });
};
