import _ from "lodash";

import { log_standard_event } from "src/core/analytics.js";

import { CovidMeasure } from "./CovidMeasure.js";
import {
  query_gov_years_with_covid_data,
  query_org_years_with_covid_data,
  query_all_covid_measures,
  query_org_covid_measures,
  query_all_covid_estimates_by_measure,
  query_org_covid_estimates_by_measure,
  query_all_covid_expenditures_by_measure,
  query_org_covid_expenditures_by_measure,
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

  const time_at_request = Date.now();
  return query({ id }).then((years_with_covid_data) => {
    const resp_time = Date.now() - time_at_request;
    if (!_.isEmpty(years_with_covid_data)) {
      // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_SUCCESS",
        MISC2: `Years with covid data, ${level}, took ${resp_time} ms`,
      });
    } else {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_UNEXPECTED",
        MISC2: `Years with covid data, ${level}, took ${resp_time} ms`,
      });
    }

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

const _subject_ids_with_loaded_measures = {};
export const api_load_covid_measures = (subject) => {
  const level = (subject && subject.level === "dept") || "all";

  const { is_loaded, id, query } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_measures, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: query_org_covid_measures,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: query_all_covid_measures,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  return query({ id })
    .then((covid_measures) => {
      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_measures)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_measures,
        (covid_measure) =>
          CovidMeasure.lookup(covid_measure.id) ||
          CovidMeasure.create_and_register(covid_measure)
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_measures,
        `${level}.${id}`,
        true,
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid measures, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const _subject_ids_with_loaded_estimates_by_measure = {};
export const api_load_covid_estimates_by_measure = (subject) => {
  const level = subject && subject.level === "dept" ? "dept" : "all";

  const { is_loaded, id, query } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_estimates_by_measure, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: query_org_covid_estimates_by_measure,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: query_all_covid_estimates_by_measure,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  return query({ id })
    .then((covid_estimates_by_measure) => {
      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_estimates_by_measure)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid estimates by measure, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid estimates by measure, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_estimates_by_measure,
        ({
          covid_data: { fiscal_year, covid_estimates },
          ...covid_measure
        }) => {
          if (!CovidMeasure.lookup(covid_measure.id)) {
            CovidMeasure.create_and_register(covid_measure);
          }

          CovidMeasure.extend_with_data(covid_measure.id, "estimates", {
            fiscal_year,
            ...covid_estimates,
          });
        }
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_measures,
        `${level}.${id}`,
        true,
        Object
      );

      _.setWith(
        _subject_ids_with_loaded_estimates_by_measure,
        `${level}.${id}`,
        true,
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid estimates by measure, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const _subject_ids_with_loaded_expenditures_by_measure = {};
export const api_load_covid_expenditures_by_measure = (subject) => {
  const level = subject && subject.level === "dept" ? "dept" : "all";

  const { is_loaded, id, query } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_expenditures_by_measure, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: query_org_covid_expenditures_by_measure,
        };
      default:
        return {
          is_loaded: all_is_loaded(),
          id: "all",
          query: query_all_covid_expenditures_by_measure,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  return query({ id })
    .then((covid_expenditures_by_measure) => {
      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_expenditures_by_measure)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid expenditures by measure, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid expenditures by measure, took ${resp_time} ms`,
        });
      }

      _.each(
        covid_expenditures_by_measure,
        ({
          covid_data: { fiscal_year, covid_expenditures },
          ...covid_measure
        }) => {
          if (!CovidMeasure.lookup(covid_measure.id)) {
            CovidMeasure.create_and_register(covid_measure);
          }

          CovidMeasure.extend_with_data(covid_measure.id, "expenditures", {
            fiscal_year,
            ...covid_expenditures,
          });
        }
      );

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_measures,
        `${level}.${id}`,
        true,
        Object
      );

      _.setWith(
        _subject_ids_with_loaded_expenditures_by_measure,
        `${level}.${id}`,
        true,
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid expenditures by measure, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};
