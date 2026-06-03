import _ from "lodash";

import { Program } from "src/models/subjects";
import { year_templates } from "src/models/years";

import {
  PROGRAM_FTE_HIST_FIELDS,
  PROGRAM_SPENDING_EXP_FIELDS,
  PROGRAM_SPENDING_PLANNING_FIELDS,
} from "./finance_utils";

const { std_years, planning_years } = year_templates;

export const map_program_spending_row_to_table_row = (row) => {
  const program = Program.store.lookup(row.program_id);
  const table_row = {
    prgm: program.name,
    program_id: row.program_id,
  };

  std_years.forEach((yr, index) => {
    table_row[`${yr}exp`] = row[PROGRAM_SPENDING_EXP_FIELDS[index]] || 0;
  });
  planning_years.forEach((yr, index) => {
    table_row[yr] = row[PROGRAM_SPENDING_PLANNING_FIELDS[index]] || 0;
  });

  return table_row;
};

export const map_program_fte_row_to_table_row = (row) => {
  const program = Program.store.lookup(row.program_id);
  const table_row = {
    prgm: program.name,
    program_id: row.program_id,
  };

  std_years.forEach((yr, index) => {
    table_row[yr] = row[PROGRAM_FTE_HIST_FIELDS[index]] || 0;
  });
  planning_years.forEach((yr, index) => {
    table_row[yr] = row[PROGRAM_SPENDING_PLANNING_FIELDS[index]] || 0;
  });

  return table_row;
};

export const program_spending_rows_to_table_rows = (rows) =>
  _.map(rows || [], map_program_spending_row_to_table_row);

export const program_fte_rows_to_table_rows = (rows) =>
  _.map(rows || [], map_program_fte_row_to_table_row);
