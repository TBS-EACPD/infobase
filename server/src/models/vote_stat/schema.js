import _ from "lodash";

//import { estimates_years, previous_year, public_account_years } from '../constants';
import { en_fr } from "../schema_utils";

const schema = `

  extend type Org {
    pa_vote_stat: PAVoteStat 
    estimates_vote_stat: EstimatesVoteStat
  }

  #TODO: have a gov-level schema as well 

  type PAVoteStat {
    data(year: PublicAccountsYear) : [ PaVoteStatRecord ]
    info: PAVoteStatInfo
  }

  type PaVoteStatRecord {
    year: PublicAccountsYear
    auth: Float
    exp: Float
    vote_num: String
    vs_type: String
    name: String
  }

  type PAVoteStatInfo {
    yearly_totals: [CollapsedPAVoteStatRecord]
  }

  type CollapsedPAVoteStatRecord {
    auth: Float
    exp: Float
    year: PublicAccountsYear
  }

  type EstimatesVoteStat {
    data(year: EstimateYear): [EstimateRecord]
    info: EstimatesInfo
  }

  type EstimateRecord {
    year: EstimateYear
    amount: Float
    vs_type: String
    vote_num: String
    doc: String
    name: String
  }

  type CollapseEstimatesRecord {
    auth: Float
    exp: Float
    year: EstimateYear
  }

  type EstimatesInfo {
    yearly_totals: [CollapsedEstimatesRecord]
  }

  type CollapsedEstimatesRecord {
    year: EstimateYear
    amount: Float
  }

  enum EstimateYear {
    est_in_year
    est_last_year
    est_last_year_2
    est_last_year_3
  }

  extend type Program {
    vote_stat_data(year: PublicAccountsYear): [ VSTypeRecord ]
  }

  type VSTypeRecord {
    year: PublicAccountsYear
    exp: Float
    vs_type: VSType
  }

  enum VSType {
    V
    S
  }

`;

export default function ({ models }) {
  const { PAVoteStat, EstimatesVoteStat, ProgramVoteStat } = models;

  function get_pa_vs_data_for_org(org, { year }) {
    let flat_records = PAVoteStat.get_flat_dept_records(org.dept_code);

    return { org, flat_records };
  }

  function get_estimates_data_for_org(org, { year }) {
    let flat_records = EstimatesVoteStat.get_flat_dept_records(org.dept_code);

    return { org, flat_records };
  }

  function get_dept_pa_info({ org, flat_records }) {
    const yearly_totals = _.chain(flat_records)
      .groupBy("year")
      .map((group, year) => ({
        year,
        auth: _.sumBy(group, "auth"),
        exp: _.sumBy(group, "exp"),
      }))
      .value();

    return {
      yearly_totals,
    };
  }

  function get_dept_estimates_info({ org, flat_records }) {
    const yearly_totals = _.chain(flat_records)
      .groupBy("year")
      .map((group, year) => ({
        year,
        amount: _.sumBy(group, "amount"),
      }))
      .value();

    return {
      yearly_totals,
    };
  }

  const resolvers = {
    Org: {
      pa_vote_stat: get_pa_vs_data_for_org,
      estimates_vote_stat: get_estimates_data_for_org,
    },

    PAVoteStat: {
      data: ({ org, flat_records }, { year }) =>
        year
          ? _.chain(flat_records)
              .filter({ year })
              .filter(({ auth, exp }) => auth || exp)
              .value()
          : flat_records,
      info: get_dept_pa_info,
    },
    PaVoteStatRecord: { name: en_fr("name_en", "name_fr") },
    EstimatesVoteStat: {
      data: ({ org, flat_records }, { year }) =>
        year
          ? _.chain(flat_records).filter({ year }).filter("amount").value()
          : flat_records,
      info: get_dept_estimates_info,
    },
    EstimateRecord: { name: en_fr("name_en", "name_fr") },
    Program: {
      vote_stat_data: (program, { year }) => {
        return ProgramVoteStat.get_flat_program_records(
          program.id,
          year ? [year] : null
        );
      },
    },
  };

  return {
    schema,
    resolvers,
  };
}
