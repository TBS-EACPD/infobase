import { run_template } from './text.js';

const year_templates = {
  std_years: [
    "{{pa_last_year_5}}",
    "{{pa_last_year_4}}",
    "{{pa_last_year_3}}",
    "{{pa_last_year_2}}",
    '{{pa_last_year}}',
  ],
  current_fiscal_year: "{{current_fiscal_year}}",
  in_year_years: [
    "{{est_in_year}}",
  ],
  estimates_years: [
    "{{est_last_year_4}}",
    "{{est_last_year_3}}",
    "{{est_last_year_2}}",
    "{{est_last_year}}",
    "{{est_in_year}}",
    //"{{est_next_year}}",
  ],
  cr_estimates_years: [
    "{{est_last_year}}",
    "{{est_in_year}}",
  ],
  planning_last_year: '{{planning_last_year_1}}',
  planning_years: [
    '{{planning_year_1}}',
    '{{planning_year_2}}',
    '{{planning_year_3}}',
  ],
  years_short: [ 
    "{{pa_last_year_5_short_first}}",
    "{{pa_last_year_4_short_first}}",
    "{{pa_last_year_3_short_first}}",
    "{{pa_last_year_2_short_first}}",
    '{{pa_last_year_short_first}}',
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

const year_values = _.mapValues(
  year_templates,
  (templates) => _.map(templates, run_template)
);

const has_actual_to_planned_gap_year = false;

export {
  year_templates,
  year_values,
  has_actual_to_planned_gap_year,
};