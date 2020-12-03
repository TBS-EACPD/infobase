import { lang } from "src/app_bootstrap/globals.js";

import { run_template } from "./text.js";

const fiscal_year_to_year = (fy_string) =>
  _.chain(fy_string).split("-").first().toNumber().value() || null;

const year_to_fiscal_year = (year) => {
  if (year) {
    const second_year = {
      en: year + 1,
      fr: (year + 1).toString().substring(2),
    }[lang];

    return `${year}-${second_year}`;
  } else {
    return "";
  }
};

const year_templates = {
  current_fiscal_year: "{{current_fiscal_year}}",
  std_years: [
    "{{pa_last_year_5}}",
    "{{pa_last_year_4}}",
    "{{pa_last_year_3}}",
    "{{pa_last_year_2}}",
    "{{pa_last_year}}",
  ],
  tp_by_region_years: [
    "{{tp_region_last_year_5}}",
    "{{tp_region_last_year_4}}",
    "{{tp_region_last_year_3}}",
    "{{tp_region_last_year_2}}",
    "{{tp_region_last_year}}",
  ],
  years_short: [
    "{{pa_last_year_5_short_first}}",
    "{{pa_last_year_4_short_first}}",
    "{{pa_last_year_3_short_first}}",
    "{{pa_last_year_2_short_first}}",
    "{{pa_last_year_short_first}}",
  ],
  estimates_years: [
    "{{est_last_year_4}}",
    "{{est_last_year_3}}",
    "{{est_last_year_2}}",
    "{{est_last_year}}",
    "{{est_in_year}}",
    //"{{est_next_year}}",
  ],
  pa_last_year_planned: "{{pa_last_year_planned}}",
  planning_years: [
    "{{planning_year_1}}",
    "{{planning_year_2}}",
    "{{planning_year_3}}",
  ],
  people_years: [
    "{{ppl_last_year_5}}",
    "{{ppl_last_year_4}}",
    "{{ppl_last_year_3}}",
    "{{ppl_last_year_2}}",
    "{{ppl_last_year}}",
  ],
  people_years_short_second: [
    "{{ppl_last_year_5_short_second}}",
    "{{ppl_last_year_4_short_second}}",
    "{{ppl_last_year_3_short_second}}",
    "{{ppl_last_year_2_short_second}}",
    "{{ppl_last_year_short_second}}",
  ],
};

const actual_to_planned_gap_year = _.chain(year_templates)
  .thru(({ std_years, planning_years }) => [
    _.last(std_years),
    _.first(planning_years),
  ])
  .map((fiscal_year) =>
    _.chain(fiscal_year)
      .thru(run_template)
      .split("-")
      .first()
      .parseInt()
      .value()
  )
  .thru(([last_pa_year, first_planning_year]) => {
    if (first_planning_year - last_pa_year == 2) {
      const first_year = last_pa_year + 1;
      const second_year =
        lang === "en"
          ? first_planning_year.toString().substring(2)
          : first_planning_year;

      return `${first_year}-${second_year}`;
    } else if (first_planning_year - last_pa_year > 2) {
      throw new Error(
        "The gap between the latest Public Accounts year and the first Planning year is more than one fiscal year. This should never happen?"
      );
    } else {
      return false;
    }
  })
  .value();

export {
  fiscal_year_to_year,
  year_to_fiscal_year,
  year_templates,
  actual_to_planned_gap_year,
};
