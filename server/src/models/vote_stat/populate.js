import _ from "lodash";

import {
  public_account_years_auth_exp,
  estimates_years,
  public_account_years,
} from "../constants.js";
import {
  get_standard_csv_file_rows,
  create_program_id,
} from "../load_utils.js";

export default function ({ models }) {
  const { PAVoteStat, EstimatesVoteStat, ProgramVoteStat } = models;

  const pa_records = get_standard_csv_file_rows("pa_vote_stat.csv");
  const estimates_records = get_standard_csv_file_rows(
    "estimates_votestat.csv"
  );

  const program_vs_records = get_standard_csv_file_rows(
    "program_vote_stat.csv"
  );

  const prog_years = _.takeRight(public_account_years, 2);
  _.each(program_vs_records, (obj) => {
    obj.program_id = create_program_id(obj);
    _.each(prog_years, (col) => {
      obj[col] = obj[col] && parseFloat(obj[col]);
    });
  });

  _.each(pa_records, (record) => {
    _.each(
      public_account_years_auth_exp,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  _.each(estimates_records, (record) => {
    _.each(
      estimates_years,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  _.each(pa_records, (record) => PAVoteStat.register(record));
  _.each(estimates_records, (record) => EstimatesVoteStat.register(record));
  _.each(program_vs_records, (record) => ProgramVoteStat.register(record));
}
