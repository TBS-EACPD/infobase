import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramRevSobjsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  programId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type ProgramRevSobjsQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', program_sobjs?: Array<{ __typename?: 'ProgramSobjs', so_num?: number | null, pa_exp_last_year_5?: number | null, pa_exp_last_year_4?: number | null, pa_exp_last_year_3?: number | null, pa_exp_last_year_2?: number | null, pa_exp_last_year?: number | null, pa_rev_last_year_5?: number | null, pa_rev_last_year_4?: number | null, pa_rev_last_year_3?: number | null, pa_rev_last_year_2?: number | null, pa_rev_last_year?: number | null } | null> | null } | null } };


export const ProgramRevSobjsDocument = gql`
    query ProgramRevSobjs($lang: String!, $programId: String) {
  root(lang: $lang) {
    program(id: $programId) {
      program_sobjs {
        so_num
        pa_exp_last_year_5
        pa_exp_last_year_4
        pa_exp_last_year_3
        pa_exp_last_year_2
        pa_exp_last_year
        pa_rev_last_year_5
        pa_rev_last_year_4
        pa_rev_last_year_3
        pa_rev_last_year_2
        pa_rev_last_year
      }
    }
  }
}
    `;

/**
 * __useProgramRevSobjsQuery__
 *
 * To run a query within a React component, call `useProgramRevSobjsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramRevSobjsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramRevSobjsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useProgramRevSobjsQuery(baseOptions: Apollo.QueryHookOptions<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>(ProgramRevSobjsDocument, options);
      }
export function useProgramRevSobjsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>(ProgramRevSobjsDocument, options);
        }
export type ProgramRevSobjsQueryHookResult = ReturnType<typeof useProgramRevSobjsQuery>;
export type ProgramRevSobjsLazyQueryHookResult = ReturnType<typeof useProgramRevSobjsLazyQuery>;
export type ProgramRevSobjsQueryResult = Apollo.QueryResult<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>;