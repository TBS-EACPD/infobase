import _ from "lodash";
import {
  get_standard_csv_file_rows,
  create_program_id,
} from '../load_utils.js';

export default async function({models}){
  const { ProgramSpending, ProgramFte } = models;

  const programSpending_records = _.chain(get_standard_csv_file_rows("program_spending.csv"))
    .map(obj => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map(obj => new ProgramSpending(obj))
    .value();

  const programFte_records = _.chain(get_standard_csv_file_rows("program_ftes.csv"))
    .map(obj => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map(obj => new ProgramFte(obj))
    .value();

  await ProgramSpending.insertMany(programSpending_records);
  return await ProgramFte.insertMany(programFte_records);
}
