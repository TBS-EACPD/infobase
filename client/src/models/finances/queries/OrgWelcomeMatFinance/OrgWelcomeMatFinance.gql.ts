import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { ProgramSpendingFieldsFragmentDoc, ProgramFteFieldsFragmentDoc, OrgVoteStatPaFieldsFragmentDoc, OrgVoteStatEstimatesFieldsFragmentDoc, OrgSobjsFieldsFragmentDoc, OrgTransferPaymentsFieldsFragmentDoc, ProgramVoteStatFieldsFragmentDoc, ProgramSobjsFieldsFragmentDoc } from '../_fragments.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgWelcomeMatFinanceQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
}>;


export type OrgWelcomeMatFinanceQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', program_spending?: Array<{ __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, program_fte?: Array<{ __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, org_vote_stat_pa?: Array<{ __typename?: 'OrgVoteStatPa', dept_code?: string | null, vote_num?: string | null, vs_type?: number | null, name?: string | null, pa_last_year_5_auth?: number | null, pa_last_year_4_auth?: number | null, pa_last_year_3_auth?: number | null, pa_last_year_2_auth?: number | null, pa_last_year_auth?: number | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_5_unlapsed?: number | null, pa_last_year_4_unlapsed?: number | null, pa_last_year_3_unlapsed?: number | null, pa_last_year_2_unlapsed?: number | null, pa_last_year_unlapsed?: number | null } | null> | null, org_vote_stat_estimates?: Array<{ __typename?: 'OrgVoteStatEstimates', dept_code?: string | null, vote_num?: string | null, vs_type?: number | null, name?: string | null, doc?: string | null, est_last_year_4?: number | null, est_last_year_3?: number | null, est_last_year_2?: number | null, est_last_year?: number | null, est_in_year?: number | null } | null> | null, org_sobjs?: Array<{ __typename?: 'OrgSobjs', so_num?: number | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year_1?: number | null } | null> | null, org_transfer_payments?: Array<{ __typename?: 'OrgTransferPayments', dept_code?: string | null, type?: string | null, name?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_1_exp?: number | null } | null> | null } | null } };


export const OrgWelcomeMatFinanceDocument = gql`
    query OrgWelcomeMatFinance($lang: String!, $org_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      program_spending {
        ...ProgramSpendingFields
      }
      program_fte {
        ...ProgramFteFields
      }
      org_vote_stat_pa {
        ...OrgVoteStatPaFields
      }
      org_vote_stat_estimates {
        ...OrgVoteStatEstimatesFields
      }
      org_sobjs {
        ...OrgSobjsFields
      }
      org_transfer_payments {
        ...OrgTransferPaymentsFields
      }
    }
  }
}
    ${ProgramSpendingFieldsFragmentDoc}
${ProgramFteFieldsFragmentDoc}
${OrgVoteStatPaFieldsFragmentDoc}
${OrgVoteStatEstimatesFieldsFragmentDoc}
${OrgSobjsFieldsFragmentDoc}
${OrgTransferPaymentsFieldsFragmentDoc}`;

/**
 * __useOrgWelcomeMatFinanceQuery__
 *
 * To run a query within a React component, call `useOrgWelcomeMatFinanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgWelcomeMatFinanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgWelcomeMatFinanceQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *   },
 * });
 */
export function useOrgWelcomeMatFinanceQuery(baseOptions: Apollo.QueryHookOptions<OrgWelcomeMatFinanceQuery, OrgWelcomeMatFinanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgWelcomeMatFinanceQuery, OrgWelcomeMatFinanceQueryVariables>(OrgWelcomeMatFinanceDocument, options);
      }
export function useOrgWelcomeMatFinanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgWelcomeMatFinanceQuery, OrgWelcomeMatFinanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgWelcomeMatFinanceQuery, OrgWelcomeMatFinanceQueryVariables>(OrgWelcomeMatFinanceDocument, options);
        }
export type OrgWelcomeMatFinanceQueryHookResult = ReturnType<typeof useOrgWelcomeMatFinanceQuery>;
export type OrgWelcomeMatFinanceLazyQueryHookResult = ReturnType<typeof useOrgWelcomeMatFinanceLazyQuery>;
export type OrgWelcomeMatFinanceQueryResult = Apollo.QueryResult<OrgWelcomeMatFinanceQuery, OrgWelcomeMatFinanceQueryVariables>;