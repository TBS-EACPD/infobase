import _ from "lodash";
import {
  public_account_years,
  correct_planning_years,
  public_account_years_auth_exp,
} from "../constants";

export const financial_cols = public_account_years_auth_exp.concat([
  "pa_last_year_planned",
  ...correct_planning_years,
]);

export const expenditure_cols = _.map(
  public_account_years,
  (year) => `${year}_exp`
).concat(correct_planning_years);

export const fte_cols = [...public_account_years, ...correct_planning_years];
