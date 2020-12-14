import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_foreignkey_attr_dataloader } from "../loader_utils.js";
import {
  number_type,
  str_type,
  parent_fkey_type,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const OrgVoteStatPaSchema = mongoose.Schema({
    dept_code: parent_fkey_type(),
    vote_num: str_type,
    vs_type: number_type,
    ...bilingual("name", { ...str_type, required: true }),

    pa_last_year_5_auth: number_type,
    pa_last_year_4_auth: number_type,
    pa_last_year_3_auth: number_type,
    pa_last_year_2_auth: number_type,
    pa_last_year_auth: number_type,

    pa_last_year_5_exp: number_type,
    pa_last_year_4_exp: number_type,
    pa_last_year_3_exp: number_type,
    pa_last_year_2_exp: number_type,
    pa_last_year_exp: number_type,

    pa_last_year_5_unlapsed: number_type,
    pa_last_year_4_unlapsed: number_type,
    pa_last_year_3_unlapsed: number_type,
    pa_last_year_2_unlapsed: number_type,
    pa_last_year_unlapsed: number_type,
  });
  const OrgVoteStatEstimatesSchema = mongoose.Schema({
    dept_code: parent_fkey_type(),
    vote_num: str_type,
    vs_type: number_type,
    ...bilingual("name", { ...str_type, required: true }),
    doc: str_type,

    est_last_year_4: number_type,
    est_last_year_3: number_type,
    est_last_year_2: number_type,
    est_last_year: number_type,
    est_in_year: number_type,
  });
  const OrgTransferPaymentsSchema = mongoose.Schema({
    dept_code: parent_fkey_type(),
    type: str_type,
    ...bilingual("name", { ...str_type, required: true }),
    pa_last_year_5_auth: number_type,
    pa_last_year_4_auth: number_type,
    pa_last_year_3_auth: number_type,
    pa_last_year_2_auth: number_type,
    pa_last_year_1_auth: number_type,

    pa_last_year_5_exp: number_type,
    pa_last_year_4_exp: number_type,
    pa_last_year_3_exp: number_type,
    pa_last_year_2_exp: number_type,
    pa_last_year_1_exp: number_type,
  });
  const ProgramSobjsSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    so_num: number_type,
    pa_last_year_3: number_type,
    pa_last_year_2: number_type,
    pa_last_year: number_type,
  });
  const ProgramVoteStatSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    vs_type: str_type,
    pa_last_year_3: number_type,
    pa_last_year_2: number_type,
    pa_last_year: number_type,
  });
  const ProgramSpendingSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    pa_last_year_5_exp: number_type,
    pa_last_year_4_exp: number_type,
    pa_last_year_3_exp: number_type,
    pa_last_year_2_exp: number_type,
    pa_last_year_exp: number_type,

    planning_year_1: number_type,
    planning_year_1_rev: number_type,
    planning_year_1_spa: number_type,
    planning_year_1_gross: number_type,

    planning_year_2: number_type,
    planning_year_2_rev: number_type,
    planning_year_2_spa: number_type,
    planning_year_2_gross: number_type,

    planning_year_3: number_type,
    planning_year_3_rev: number_type,
    planning_year_3_spa: number_type,
    planning_year_3_gross: number_type,
  });
  const ProgramFteSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    pa_last_year_5: number_type,
    pa_last_year_4: number_type,
    pa_last_year_3: number_type,
    pa_last_year_2: number_type,
    pa_last_year: number_type,
    pa_last_year_planned: number_type,

    planning_year_1: number_type,
    planning_year_2: number_type,
    planning_year_3: number_type,
  });

  model_singleton.define_model("OrgVoteStatPa", OrgVoteStatPaSchema);
  model_singleton.define_model(
    "OrgVoteStatEstimates",
    OrgVoteStatEstimatesSchema
  );
  model_singleton.define_model(
    "OrgTransferPayments",
    OrgTransferPaymentsSchema
  );

  model_singleton.define_model("ProgramSobjs", ProgramSobjsSchema);
  model_singleton.define_model("ProgramVoteStat", ProgramVoteStatSchema);
  model_singleton.define_model("ProgramSpending", ProgramSpendingSchema);
  model_singleton.define_model("ProgramFte", ProgramFteSchema);

  const {
    OrgVoteStatPa,
    OrgVoteStatEstimates,
    OrgTransferPayments,
    ProgramSobjs,
    ProgramVoteStat,
    ProgramSpending,
    ProgramFte,
  } = model_singleton.models;

  const loaders = {
    orgVoteStatPa_loader: create_resource_by_foreignkey_attr_dataloader(
      OrgVoteStatPa,
      "dept_code"
    ),
    orgVoteStatEstimates_loader: create_resource_by_foreignkey_attr_dataloader(
      OrgVoteStatEstimates,
      "dept_code"
    ),
    orgTransferPayments_loader: create_resource_by_foreignkey_attr_dataloader(
      OrgTransferPayments,
      "dept_code"
    ),
    programSobjs_loader: create_resource_by_foreignkey_attr_dataloader(
      ProgramSobjs,
      "program_id"
    ),
    programVoteStat_loader: create_resource_by_foreignkey_attr_dataloader(
      ProgramVoteStat,
      "program_id"
    ),
    programSpending_loader: create_resource_by_foreignkey_attr_dataloader(
      ProgramSpending,
      "program_id"
    ),
    programFte_loader: create_resource_by_foreignkey_attr_dataloader(
      ProgramFte,
      "program_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
