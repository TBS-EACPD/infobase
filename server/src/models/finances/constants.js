import _ from "lodash";
import {
  public_account_years,
  extended_planning_years,
  public_account_years_auth_exp,
} from "../constants";

export const financial_cols = public_account_years_auth_exp.concat([
  ...extended_planning_years,
]);

export const expenditure_cols = _.map(
  public_account_years,
  (year) => `${year}_exp`
).concat(extended_planning_years);

export const fte_cols = [...public_account_years, ...extended_planning_years];
