import { bilingual_field } from "../schema_utils.js";

const schema = `
  extend type Org{
    org_vote_stat_pa: [OrgVoteStatPa]
    org_vote_stat_estimates: [OrgVoteStatEstimates]
    org_transfer_payments: [OrgTransferPayments]
  }
  
  extend type Program{
    program_sobjs: [ProgramSobjs]
    program_vote_stat: [ProgramVoteStat]
    program_spending: [ProgramSpending]
    program_fte: [ProgramFte]
  }

  type OrgVoteStatPa{
    vote_num: String
    vs_type: Float
    name: String
  
    pa_last_year_5_auth: Float,
    pa_last_year_4_auth: Float,
    pa_last_year_3_auth: Float,
    pa_last_year_2_auth: Float,
    pa_last_year_auth: Float,
  
    pa_last_year_5_exp: Float,
    pa_last_year_4_exp: Float,
    pa_last_year_3_exp: Float,
    pa_last_year_2_exp: Float,
    pa_last_year_exp: Float,
  }
  type OrgVoteStatEstimates{
    vote_num: String
    vs_type: Float
    name: String
    doc: String
  
    est_last_year_4: Float,
    est_last_year_3: Float,
    est_last_year_2: Float,
    est_last_year: Float,
    est_in_year: Float,
  }
  type OrgTransferPayments{
    type: String,
    name: String
  
    pa_last_year_5_auth: Float,
    pa_last_year_4_auth: Float,
    pa_last_year_3_auth: Float,
    pa_last_year_2_auth: Float,
    pa_last_year_1_auth: Float,
  
    pa_last_year_5_exp: Float,
    pa_last_year_4_exp: Float,
    pa_last_year_3_exp: Float,
    pa_last_year_2_exp: Float,
    pa_last_year_1_exp: Float,
  }
  type ProgramSobjs{
    so_num: Float
    pa_last_year_3: Float
    pa_last_year_2: Float
    pa_last_year: Float
  }
  type ProgramVoteStat{
    vs_type: String
    pa_last_year_3: Float
    pa_last_year_2: Float
    pa_last_year: Float
  }
  type ProgramSpending{
    pa_last_year_5_exp: Float
    pa_last_year_4_exp: Float
    pa_last_year_3_exp: Float
    pa_last_year_2_exp: Float
    pa_last_year_exp: Float

    planning_year_1: Float
    planning_year_1_rev: Float
    planning_year_1_spa: Float
    planning_year_1_gross: Float

    planning_year_2: Float
    planning_year_2_rev: Float
    planning_year_2_spa: Float
    planning_year_2_gross: Float

    planning_year_3: Float
    planning_year_3_rev: Float
    planning_year_3_spa: Float
    planning_year_3_gross: Float
  }
  type ProgramFte{
    pa_last_year_5: Float,
    pa_last_year_4: Float,
    pa_last_year_3: Float,
    pa_last_year_2: Float,
    pa_last_year: Float,
    pa_last_year_planned: Float,

    planning_year_1: Float,
    planning_year_2: Float,
    planning_year_3: Float,
  }
`;

export default function ({ models, loaders }) {
  const {
    orgVoteStatPa_loader,
    orgVoteStatEstimates_loader,
    orgTransferPayments_loader,
    programSobjs_loader,
    programVoteStat_loader,
    programSpending_loader,
    programFte_loader,
  } = loaders;

  const resolvers = {
    Org: {
      org_vote_stat_pa: (org) =>
        org.dept_code ? orgVoteStatPa_loader.load(org.dept_code) : null,
      org_vote_stat_estimates: (org) =>
        org.dept_code ? orgVoteStatEstimates_loader.load(org.dept_code) : null,
      org_transfer_payments: (org) =>
        org.dept_code ? orgTransferPayments_loader.load(org.dept_code) : null,
    },
    Program: {
      program_sobjs: (prog) => programSobjs_loader.load(prog.program_id),
      program_vote_stat: (prog) => programVoteStat_loader.load(prog.program_id),
      program_spending: (prog) => programSpending_loader.load(prog.program_id),
      program_fte: (prog) => programFte_loader.load(prog.program_id),
    },
    OrgVoteStatPa: {
      name: bilingual_field("name"),
    },
    OrgVoteStatEstimates: {
      name: bilingual_field("name"),
    },
    OrgTransferPayments: {
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
