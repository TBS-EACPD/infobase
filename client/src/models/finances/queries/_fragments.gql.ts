import * as Types from '../../../types/types.gql';

import { gql } from '@apollo/client';
export type ProgramSpendingFieldsFragment = { __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null };

export type ProgramFteFieldsFragment = { __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null };

export type OrgVoteStatPaExpFieldsFragment = { __typename?: 'OrgVoteStatPa', pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null };

export type OrgVoteStatEstimatesFieldsFragment = { __typename?: 'OrgVoteStatEstimates', est_in_year?: number | null };

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
export const OrgVoteStatEstimatesFieldsFragmentDoc = gql`
    fragment OrgVoteStatEstimatesFields on OrgVoteStatEstimates {
  est_in_year
}
    `;