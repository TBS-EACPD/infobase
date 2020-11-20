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
    get_standard_csv_file_rows("program_sobjs.csv")
  )
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
    }))
    .map((obj) => new ProgramSobjs(obj))
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
    ProgramVoteStat.insertMany(programVoteStat_records),
    ProgramSpending.insertMany(programSpending_records),
    ProgramFte.insertMany(programFte_records),
  ]);
}
