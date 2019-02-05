import _ from "lodash";
import { financial_cols, fte_cols } from './constants';
import {
  get_standard_csv_file_rows,
  create_program_id,
} from '../load_utils.js';


export default function({models}){

  const { ProgramSpending, ProgramFte } = models;

  const csv_spend_records = get_standard_csv_file_rows("program_spending.csv");
  const csv_fte_records = get_standard_csv_file_rows("program_ftes.csv");



  const spend_records =  csv_spend_records.map(obj => _.assign({
    program_id: create_program_id(obj),
  },obj));

  _.each(spend_records, record => {
    _.each(financial_cols, col => record[col] = record[col] && parseFloat(record[col]));
  })

  const fte_records =  csv_fte_records.map(obj => _.assign({
    program_id: create_program_id(obj),
  },obj));


  _.each(fte_records, record => {
    _.each(fte_cols, col => record[col] = record[col] && parseFloat(record[col]));
  })



  _.each(spend_records, record => ProgramSpending.register(record));
  _.each(fte_records, record => ProgramFte.register(record));
  

}
