import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramSobjsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  programId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type ProgramSobjsQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', program_sobjs?: Array<{ __typename?: 'ProgramSobjs', so_num?: number | null, pa_exp_last_year_5?: number | null, pa_exp_last_year_4?: number | null, pa_exp_last_year_3?: number | null, pa_exp_last_year_2?: number | null, pa_exp_last_year?: number | null, pa_rev_last_year_5?: number | null, pa_rev_last_year_4?: number | null, pa_rev_last_year_3?: number | null, pa_rev_last_year_2?: number | null, pa_rev_last_year?: number | null } | null> | null } | null } };


export const ProgramSobjsDocument = gql`
    query ProgramSobjs($lang: String!, $programId: String) {
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
 * __useProgramSobjsQuery__
 *
 * To run a query within a React component, call `useProgramSobjsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramSobjsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramSobjsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useProgramSobjsQuery(baseOptions: Apollo.QueryHookOptions<ProgramSobjsQuery, ProgramSobjsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramSobjsQuery, ProgramSobjsQueryVariables>(ProgramSobjsDocument, options);
      }
export function useProgramSobjsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramSobjsQuery, ProgramSobjsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramSobjsQuery, ProgramSobjsQueryVariables>(ProgramSobjsDocument, options);
        }
export type ProgramSobjsQueryHookResult = ReturnType<typeof useProgramSobjsQuery>;
export type ProgramSobjsLazyQueryHookResult = ReturnType<typeof useProgramSobjsLazyQuery>;
export type ProgramSobjsQueryResult = Apollo.QueryResult<ProgramSobjsQuery, ProgramSobjsQueryVariables>;