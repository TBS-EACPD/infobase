import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramExpSobjsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  programId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type ProgramExpSobjsQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', program_exp_sobjs?: Array<{ __typename?: 'ProgramExpSobjs', so_num?: number | null, pa_exp_last_year_5?: number | null, pa_exp_last_year_4?: number | null, pa_exp_last_year_3?: number | null, pa_exp_last_year_2?: number | null, pa_exp_last_year?: number | null } | null> | null } | null } };


export const ProgramExpSobjsDocument = gql`
    query ProgramExpSobjs($lang: String!, $programId: String) {
  root(lang: $lang) {
    program(id: $programId) {
      program_exp_sobjs {
        so_num
        pa_exp_last_year_5
        pa_exp_last_year_4
        pa_exp_last_year_3
        pa_exp_last_year_2
        pa_exp_last_year
      }
    }
  }
}
    `;

/**
 * __useProgramExpSobjsQuery__
 *
 * To run a query within a React component, call `useProgramExpSobjsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramExpSobjsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramExpSobjsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useProgramExpSobjsQuery(baseOptions: Apollo.QueryHookOptions<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>(ProgramExpSobjsDocument, options);
      }
export function useProgramExpSobjsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>(ProgramExpSobjsDocument, options);
        }
export type ProgramExpSobjsQueryHookResult = ReturnType<typeof useProgramExpSobjsQuery>;
export type ProgramExpSobjsLazyQueryHookResult = ReturnType<typeof useProgramExpSobjsLazyQuery>;
export type ProgramExpSobjsQueryResult = Apollo.QueryResult<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>;