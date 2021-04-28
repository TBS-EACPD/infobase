import _ from "lodash";

import {
  public_account_years,
  planning_years,
  public_account_years_auth_exp,
} from "../constants.js";

export const financial_cols = public_account_years_auth_exp.concat([
  "pa_last_year_planned",
  ...planning_years,
]);

export const expenditure_cols = _.map(
  public_account_years,
  (year) => `${year}_exp`
).concat(planning_years);

export const fte_cols = [...public_account_years, ...planning_years];
