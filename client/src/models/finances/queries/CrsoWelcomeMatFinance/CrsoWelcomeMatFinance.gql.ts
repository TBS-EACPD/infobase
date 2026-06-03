import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { ProgramSpendingFieldsFragmentDoc, ProgramFteFieldsFragmentDoc, OrgVoteStatEstimatesFieldsFragmentDoc, OrgSobjsFieldsFragmentDoc, OrgVoteStatPaExpFieldsFragmentDoc, ProgramVoteStatFieldsFragmentDoc, ProgramSobjsFieldsFragmentDoc } from '../_fragments.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CrsoWelcomeMatFinanceQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  crso_id: Types.Scalars['String'];
}>;


export type CrsoWelcomeMatFinanceQuery = { __typename?: 'Query', root: { __typename?: 'Root', crso?: { __typename?: 'Crso', program_spending?: Array<{ __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, program_fte?: Array<{ __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null } | null } };


export const CrsoWelcomeMatFinanceDocument = gql`
    query CrsoWelcomeMatFinance($lang: String!, $crso_id: String!) {
  root(lang: $lang) {
    crso(id: $crso_id) {
      program_spending {
        ...ProgramSpendingFields
      }
      program_fte {
        ...ProgramFteFields
      }
    }
  }
}
    ${ProgramSpendingFieldsFragmentDoc}
${ProgramFteFieldsFragmentDoc}`;

/**
 * __useCrsoWelcomeMatFinanceQuery__
 *
 * To run a query within a React component, call `useCrsoWelcomeMatFinanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCrsoWelcomeMatFinanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCrsoWelcomeMatFinanceQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      crso_id: // value for 'crso_id'
 *   },
 * });
 */
export function useCrsoWelcomeMatFinanceQuery(baseOptions: Apollo.QueryHookOptions<CrsoWelcomeMatFinanceQuery, CrsoWelcomeMatFinanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CrsoWelcomeMatFinanceQuery, CrsoWelcomeMatFinanceQueryVariables>(CrsoWelcomeMatFinanceDocument, options);
      }
export function useCrsoWelcomeMatFinanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CrsoWelcomeMatFinanceQuery, CrsoWelcomeMatFinanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CrsoWelcomeMatFinanceQuery, CrsoWelcomeMatFinanceQueryVariables>(CrsoWelcomeMatFinanceDocument, options);
        }
export type CrsoWelcomeMatFinanceQueryHookResult = ReturnType<typeof useCrsoWelcomeMatFinanceQuery>;
export type CrsoWelcomeMatFinanceLazyQueryHookResult = ReturnType<typeof useCrsoWelcomeMatFinanceLazyQuery>;
export type CrsoWelcomeMatFinanceQueryResult = Apollo.QueryResult<CrsoWelcomeMatFinanceQuery, CrsoWelcomeMatFinanceQueryVariables>;