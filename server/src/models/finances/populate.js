import _ from "lodash";

import {
  get_standard_csv_file_rows,
  create_program_id,
} from "../load_utils.js";

export default async function ({ models }) {
  const {
    OrgVoteStatPa,
    OrgVoteStatEstimates,
    OrgTransferPayments,
    ProgramSobjs,
    ProgramExpSobjs,
    ProgramRevSobjs,
    ProgramVoteStat,
    ProgramSpending,
    ProgramFte,
  } = models;

  const orgVoteStatPa_records = _.chain(
    get_standard_csv_file_rows("org_vote_stat_pa.csv")
  )
    .map((obj) => new OrgVoteStatPa(obj))
    .value();

  const orgVoteStatEstimates_records = _.chain(
    get_standard_csv_file_rows("org_vote_stat_estimates.csv")
  )
    .map((obj) => new OrgVoteStatEstimates(obj))
    .value();

  const orgTransferPayments_records = _.chain(
    get_standard_csv_file_rows("org_transfer_payments.csv")
  )
    .map((obj) => new OrgTransferPayments(obj))
    .value();

  const programSobjs_records = _.chain(
    get_standard_csv_file_rows("program_sobjs_new.csv")
  )
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map((obj) => new ProgramSobjs(obj))
    .value();

  const programExpSobjs_records = _.chain(programSobjs_records)
    .map(
      ({
        program_id,
        so_num,
        pa_exp_last_year_5,
        pa_exp_last_year_4,
        pa_exp_last_year_3,
        pa_exp_last_year_2,
        pa_exp_last_year,
        _id,
      }) => ({
        program_id,
        so_num,
        pa_exp_last_year_5,
        pa_exp_last_year_4,
        pa_exp_last_year_3,
        pa_exp_last_year_2,
        pa_exp_last_year,
        _id,
      })
    )
    .value();

  const programRevSobjs_records = _.chain(programSobjs_records)
    .map(
      ({
        program_id,
        so_num,
        pa_rev_last_year_5,
        pa_rev_last_year_4,
        pa_rev_last_year_3,
        pa_rev_last_year_2,
        pa_rev_last_year,
        _id,
      }) => ({
        program_id,
        so_num,
        pa_rev_last_year_5,
        pa_rev_last_year_4,
        pa_rev_last_year_3,
        pa_rev_last_year_2,
        pa_rev_last_year,
        _id,
      })
    )
    .value();

  const programVoteStat_records = _.chain(
    get_standard_csv_file_rows("program_vote_stat.csv")
  )
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map((obj) => new ProgramVoteStat(obj))
    .value();

  const programSpending_records = _.chain(
    get_standard_csv_file_rows("program_spending.csv")
  )
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map((obj) => new ProgramSpending(obj))
    .value();

  const programFte_records = _.chain(
    get_standard_csv_file_rows("program_ftes.csv")
  )
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map((obj) => new ProgramFte(obj))
    .value();

  return await Promise.all([
    OrgVoteStatPa.insertMany(orgVoteStatPa_records),
    OrgVoteStatEstimates.insertMany(orgVoteStatEstimates_records),
    OrgTransferPayments.insertMany(orgTransferPayments_records),
    ProgramSobjs.insertMany(programSobjs_records),
    ProgramExpSobjs.insertMany(programExpSobjs_records),
    ProgramRevSobjs.insertMany(programRevSobjs_records),
    ProgramVoteStat.insertMany(programVoteStat_records),
    ProgramSpending.insertMany(programSpending_records),
    ProgramFte.insertMany(programFte_records),
  ]);
}
