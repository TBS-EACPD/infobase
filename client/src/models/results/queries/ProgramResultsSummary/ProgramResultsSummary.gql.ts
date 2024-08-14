import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramResultsSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  programId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type ProgramResultsSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', id?: string | null, name?: string | null, results?: Array<{ __typename?: 'Result', id?: string | null, doc?: string | null, name?: string | null, indicators?: Array<{ __typename?: 'Indicator', id?: string | null, name?: string | null, doc?: string | null, status_key?: string | null, actual_result?: string | null } | null> | null } | null> | null } | null } };


export const ProgramResultsSummaryDocument = gql`
    query ProgramResultsSummary($lang: String!, $programId: String) {
  root(lang: $lang) {
    program(id: $programId) {
      id
      name
      results {
        id
        doc
        name
        indicators {
          id
          name
          doc
          status_key
          actual_result
        }
      }
    }
  }
}
    `;

/**
 * __useProgramResultsSummaryQuery__
 *
 * To run a query within a React component, call `useProgramResultsSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramResultsSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramResultsSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useProgramResultsSummaryQuery(baseOptions: Apollo.QueryHookOptions<ProgramResultsSummaryQuery, ProgramResultsSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramResultsSummaryQuery, ProgramResultsSummaryQueryVariables>(ProgramResultsSummaryDocument, options);
      }
export function useProgramResultsSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramResultsSummaryQuery, ProgramResultsSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramResultsSummaryQuery, ProgramResultsSummaryQueryVariables>(ProgramResultsSummaryDocument, options);
        }
export type ProgramResultsSummaryQueryHookResult = ReturnType<typeof useProgramResultsSummaryQuery>;
export type ProgramResultsSummaryLazyQueryHookResult = ReturnType<typeof useProgramResultsSummaryLazyQuery>;
export type ProgramResultsSummaryQueryResult = Apollo.QueryResult<ProgramResultsSummaryQuery, ProgramResultsSummaryQueryVariables>;