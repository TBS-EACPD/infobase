import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { ProgramSpendingFieldsFragmentDoc, ProgramFteFieldsFragmentDoc, OrgVoteStatEstimatesFieldsFragmentDoc, OrgSobjsFieldsFragmentDoc, OrgVoteStatPaExpFieldsFragmentDoc, ProgramVoteStatFieldsFragmentDoc, ProgramSobjsFieldsFragmentDoc } from '../_fragments.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovWelcomeMatFinanceQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type GovWelcomeMatFinanceQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', program_spending?: Array<{ __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, program_fte?: Array<{ __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, org_vote_stat_estimates?: Array<{ __typename?: 'OrgVoteStatEstimates', dept_code?: string | null, vote_num?: string | null, vs_type?: number | null, name?: string | null, doc?: string | null, est_in_year?: number | null } | null> | null, org_sobjs?: Array<{ __typename?: 'OrgSobjs', so_num?: number | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year_1?: number | null } | null> | null } | null } };


export const GovWelcomeMatFinanceDocument = gql`
    query GovWelcomeMatFinance($lang: String!) {
  root(lang: $lang) {
    gov {
      program_spending {
        ...ProgramSpendingFields
      }
      program_fte {
        ...ProgramFteFields
      }
      org_vote_stat_estimates {
        ...OrgVoteStatEstimatesFields
      }
      org_sobjs {
        ...OrgSobjsFields
      }
    }
  }
}
    ${ProgramSpendingFieldsFragmentDoc}
${ProgramFteFieldsFragmentDoc}
${OrgVoteStatEstimatesFieldsFragmentDoc}
${OrgSobjsFieldsFragmentDoc}`;

/**
 * __useGovWelcomeMatFinanceQuery__
 *
 * To run a query within a React component, call `useGovWelcomeMatFinanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovWelcomeMatFinanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovWelcomeMatFinanceQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGovWelcomeMatFinanceQuery(baseOptions: Apollo.QueryHookOptions<GovWelcomeMatFinanceQuery, GovWelcomeMatFinanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovWelcomeMatFinanceQuery, GovWelcomeMatFinanceQueryVariables>(GovWelcomeMatFinanceDocument, options);
      }
export function useGovWelcomeMatFinanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovWelcomeMatFinanceQuery, GovWelcomeMatFinanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovWelcomeMatFinanceQuery, GovWelcomeMatFinanceQueryVariables>(GovWelcomeMatFinanceDocument, options);
        }
export type GovWelcomeMatFinanceQueryHookResult = ReturnType<typeof useGovWelcomeMatFinanceQuery>;
export type GovWelcomeMatFinanceLazyQueryHookResult = ReturnType<typeof useGovWelcomeMatFinanceLazyQuery>;
export type GovWelcomeMatFinanceQueryResult = Apollo.QueryResult<GovWelcomeMatFinanceQuery, GovWelcomeMatFinanceQueryVariables>;