import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { ProgramSpendingFieldsFragmentDoc, ProgramFteFieldsFragmentDoc, OrgVoteStatPaFieldsFragmentDoc, OrgVoteStatEstimatesFieldsFragmentDoc, OrgSobjsFieldsFragmentDoc, OrgTransferPaymentsFieldsFragmentDoc, ProgramVoteStatFieldsFragmentDoc, ProgramSobjsFieldsFragmentDoc } from '../_fragments.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramWelcomeMatFinanceQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  program_id: Types.Scalars['String'];
}>;


export type ProgramWelcomeMatFinanceQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', program_spending?: Array<{ __typename?: 'ProgramSpending', program_id?: string | null, pa_last_year_5_exp?: number | null, pa_last_year_4_exp?: number | null, pa_last_year_3_exp?: number | null, pa_last_year_2_exp?: number | null, pa_last_year_exp?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, program_fte?: Array<{ __typename?: 'ProgramFte', program_id?: string | null, pa_last_year_5?: number | null, pa_last_year_4?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null, pa_last_year_planned?: number | null, planning_year_1?: number | null, planning_year_2?: number | null, planning_year_3?: number | null } | null> | null, program_vote_stat?: Array<{ __typename?: 'ProgramVoteStat', vs_type?: string | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null } | null> | null, program_sobjs?: Array<{ __typename?: 'ProgramSobjs', so_num?: number | null, pa_last_year_3?: number | null, pa_last_year_2?: number | null, pa_last_year?: number | null } | null> | null } | null } };


export const ProgramWelcomeMatFinanceDocument = gql`
    query ProgramWelcomeMatFinance($lang: String!, $program_id: String!) {
  root(lang: $lang) {
    program(id: $program_id) {
      program_spending {
        ...ProgramSpendingFields
      }
      program_fte {
        ...ProgramFteFields
      }
      program_vote_stat {
        ...ProgramVoteStatFields
      }
      program_sobjs {
        ...ProgramSobjsFields
      }
    }
  }
}
    ${ProgramSpendingFieldsFragmentDoc}
${ProgramFteFieldsFragmentDoc}
${ProgramVoteStatFieldsFragmentDoc}
${ProgramSobjsFieldsFragmentDoc}`;

/**
 * __useProgramWelcomeMatFinanceQuery__
 *
 * To run a query within a React component, call `useProgramWelcomeMatFinanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramWelcomeMatFinanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramWelcomeMatFinanceQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      program_id: // value for 'program_id'
 *   },
 * });
 */
export function useProgramWelcomeMatFinanceQuery(baseOptions: Apollo.QueryHookOptions<ProgramWelcomeMatFinanceQuery, ProgramWelcomeMatFinanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramWelcomeMatFinanceQuery, ProgramWelcomeMatFinanceQueryVariables>(ProgramWelcomeMatFinanceDocument, options);
      }
export function useProgramWelcomeMatFinanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramWelcomeMatFinanceQuery, ProgramWelcomeMatFinanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramWelcomeMatFinanceQuery, ProgramWelcomeMatFinanceQueryVariables>(ProgramWelcomeMatFinanceDocument, options);
        }
export type ProgramWelcomeMatFinanceQueryHookResult = ReturnType<typeof useProgramWelcomeMatFinanceQuery>;
export type ProgramWelcomeMatFinanceLazyQueryHookResult = ReturnType<typeof useProgramWelcomeMatFinanceLazyQuery>;
export type ProgramWelcomeMatFinanceQueryResult = Apollo.QueryResult<ProgramWelcomeMatFinanceQuery, ProgramWelcomeMatFinanceQueryVariables>;