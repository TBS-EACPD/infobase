import { bilingual_field } from "../schema_utils.js";

const schema = `
  extend type Gov {
    org_vote_stat_pa: [OrgVoteStatPa]
    org_vote_stat_estimates: [OrgVoteStatEstimates]
    org_transfer_payments: [OrgTransferPayments]
    has_finance_data: Boolean
  }

  extend type Org{
    org_vote_stat_pa: [OrgVoteStatPa]
    org_vote_stat_estimates: [OrgVoteStatEstimates]
    org_transfer_payments: [OrgTransferPayments]
    has_finance_data: Boolean
  }
  
  extend type Program{
    program_sobjs: [ProgramSobjs]
    program_vote_stat: [ProgramVoteStat]
    program_spending: [ProgramSpending]
    program_fte: [ProgramFte]
    has_finance_data: Boolean
  }

  type OrgVoteStatPa{
    dept_code: String
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

    pa_last_year_5_unlapsed: Float,
    pa_last_year_4_unlapsed: Float,
    pa_last_year_3_unlapsed: Float,
    pa_last_year_2_unlapsed: Float,
    pa_last_year_unlapsed: Float,
  }
  type OrgVoteStatEstimates{
    dept_code: String
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
    dept_code: String
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
    
    pa_last_year_planned: Float,

    planning_year_1: Float
    planning_year_2: Float
    planning_year_3: Float
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

export default function ({ loaders, models }) {
  const {
    orgVoteStatPa_loader,
    orgVoteStatEstimates_loader,
    orgTransferPayments_loader,
    programSobjs_loader,
    programVoteStat_loader,
    programSpending_loader,
    programFte_loader,
  } = loaders;

  const {
    OrgVoteStatPa,
    OrgVoteStatEstimates,
    OrgTransferPayments,
  } = models;

  const org_has_finance_data = async (org) => {
    if (!org.dept_code) return false;
    const [pa, estimates] = await Promise.all([
      orgVoteStatPa_loader.load(org.dept_code),
      orgVoteStatEstimates_loader.load(org.dept_code),
    ]);
    return (
      (pa && pa.length > 0) || (estimates && estimates.length > 0)
    );
  };

  const program_has_finance_data = async (prog) => {
    if (!prog.program_id) return false;
    const [spending, fte] = await Promise.all([
      programSpending_loader.load(prog.program_id),
      programFte_loader.load(prog.program_id),
    ]);
    return (
      (spending && spending.length > 0) || (fte && fte.length > 0)
    );
  };

  const gov_has_finance_data = async () => {
    const [pa, estimates] = await Promise.all([
      OrgVoteStatPa.findOne({}).select("_id").lean().exec(),
      OrgVoteStatEstimates.findOne({}).select("_id").lean().exec(),
    ]);
    return !!(pa || estimates);
  };

  const resolvers = {
    Gov: {
      org_vote_stat_pa: () =>
        OrgVoteStatPa.find({}).lean().exec(),
      org_vote_stat_estimates: () =>
        OrgVoteStatEstimates.find({}).lean().exec(),
      org_transfer_payments: () =>
        OrgTransferPayments.find({}).lean().exec(),
      has_finance_data: () => gov_has_finance_data(),
    },
    Org: {
      org_vote_stat_pa: (org) =>
        org.dept_code ? orgVoteStatPa_loader.load(org.dept_code) : null,
      org_vote_stat_estimates: (org) =>
        org.dept_code ? orgVoteStatEstimates_loader.load(org.dept_code) : null,
      org_transfer_payments: (org) =>
        org.dept_code ? orgTransferPayments_loader.load(org.dept_code) : null,
      has_finance_data: (org) => org_has_finance_data(org),
    },
    Program: {
      program_sobjs: (prog) => programSobjs_loader.load(prog.program_id),
      program_vote_stat: (prog) => programVoteStat_loader.load(prog.program_id),
      program_spending: (prog) => programSpending_loader.load(prog.program_id),
      program_fte: (prog) => programFte_loader.load(prog.program_id),
      has_finance_data: (prog) => program_has_finance_data(prog),
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
