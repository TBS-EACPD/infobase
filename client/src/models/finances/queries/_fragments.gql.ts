import * as Types from '../../../types/types.gql';

import { gql } from '@apollo/client';
export type ProgramSpendingFieldsFragment = { __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null };

export type ProgramFteFieldsFragment = { __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null };

export type OrgVoteStatPaExpFieldsFragment = { __typename?: 'OrgVoteStatPa', pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null };

export type OrgVoteStatPaFieldsFragment = { __typename?: 'OrgVoteStatPa', dept_code?: string | null, vote_num?: string | null, vs_type?: number | null, name?: string | null, pa_last_year_5_auth?: number | null, pa_last_year_4_auth?: number | null, pa_last_year_3_auth?: number | null, pa_last_year_2_auth?: number | null, pa_last_year_auth?: number | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_5_unlapsed?: number | null, pa_last_year_4_unlapsed?: number | null, pa_last_year_3_unlapsed?: number | null, pa_last_year_2_unlapsed?: number | null, pa_last_year_unlapsed?: number | null };

export type OrgVoteStatEstimatesFieldsFragment = { __typename?: 'OrgVoteStatEstimates', dept_code?: string | null, vote_num?: string | null, vs_type?: number | null, name?: string | null, doc?: string | null, est_last_year_4?: number | null, est_last_year_3?: number | null, est_last_year_2?: number | null, est_last_year?: number | null, est_in_year?: number | null };

export type ProgramVoteStatFieldsFragment = { __typename?: 'ProgramVoteStat', vs_type?: string | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null };

export type OrgSobjsFieldsFragment = { __typename?: 'OrgSobjs', so_num?: number | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year_1?: number | null };

export type ProgramSobjsFieldsFragment = { __typename?: 'ProgramSobjs', so_num?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null };

export const ProgramSpendingFieldsFragmentDoc = gql`
    fragment ProgramSpendingFields on ProgramSpending {
  program_id
  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_exp
  pa_last_year_planned
  planning_year_1
  planning_year_2
  planning_year_3
}
    `;
export const ProgramFteFieldsFragmentDoc = gql`
    fragment ProgramFteFields on ProgramFte {
  program_id
  pa_last_year_5
  pa_last_year_4
  pa_last_year_3
  pa_last_year_2
  pa_last_year
  pa_last_year_planned
  planning_year_1
  planning_year_2
  planning_year_3
}
    `;
export const OrgVoteStatPaExpFieldsFragmentDoc = gql`
    fragment OrgVoteStatPaExpFields on OrgVoteStatPa {
  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_exp
}
    `;
export const OrgVoteStatPaFieldsFragmentDoc = gql`
    fragment OrgVoteStatPaFields on OrgVoteStatPa {
  dept_code
  vote_num
  vs_type
  name
  pa_last_year_5_auth
  pa_last_year_4_auth
  pa_last_year_3_auth
  pa_last_year_2_auth
  pa_last_year_auth
  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_exp
  pa_last_year_5_unlapsed
  pa_last_year_4_unlapsed
  pa_last_year_3_unlapsed
  pa_last_year_2_unlapsed
  pa_last_year_unlapsed
}
    `;
export const OrgVoteStatEstimatesFieldsFragmentDoc = gql`
    fragment OrgVoteStatEstimatesFields on OrgVoteStatEstimates {
  dept_code
  vote_num
  vs_type
  name
  doc
  est_last_year_4
  est_last_year_3
  est_last_year_2
  est_last_year
  est_in_year
}
    `;
export const ProgramVoteStatFieldsFragmentDoc = gql`
    fragment ProgramVoteStatFields on ProgramVoteStat {
  vs_type
  pa_last_year_3
  pa_last_year_2
  pa_last_year
}
    `;
export const OrgSobjsFieldsFragmentDoc = gql`
    fragment OrgSobjsFields on OrgSobjs {
  so_num
  pa_last_year_5
  pa_last_year_4
  pa_last_year_3
  pa_last_year_2
  pa_last_year_1
}
    `;
export const ProgramSobjsFieldsFragmentDoc = gql`
    fragment ProgramSobjsFields on ProgramSobjs {
  so_num
  pa_last_year_3
  pa_last_year_2
  pa_last_year
}
    `;