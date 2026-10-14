import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type IndicatorHistoryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  stableId: Types.Scalars['String'];
}>;


export type IndicatorHistoryQuery = { __typename?: 'Query', root: { __typename?: 'Root', indicators_by_stable_id?: Array<{ __typename?: 'Indicator', doc?: string | null, target_type?: string | null, target_min?: string | null, target_max?: string | null, seeking_to?: string | null, actual_result?: string | null, status_key?: string | null } | null> | null } };


export const IndicatorHistoryDocument = gql`
    query IndicatorHistory($lang: String!, $stableId: String!) {
  root(lang: $lang) {
    indicators_by_stable_id(stable_id: $stableId) {
      doc
      target_type
      target_min
      target_max
      seeking_to
      actual_result
      status_key
    }
  }
}
    `;

/**
 * __useIndicatorHistoryQuery__
 *
 * To run a query within a React component, call `useIndicatorHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useIndicatorHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIndicatorHistoryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      stableId: // value for 'stableId'
 *   },
 * });
 */
export function useIndicatorHistoryQuery(baseOptions: Apollo.QueryHookOptions<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>(IndicatorHistoryDocument, options);
      }
export function useIndicatorHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>(IndicatorHistoryDocument, options);
        }
export type IndicatorHistoryQueryHookResult = ReturnType<typeof useIndicatorHistoryQuery>;
export type IndicatorHistoryLazyQueryHookResult = ReturnType<typeof useIndicatorHistoryLazyQuery>;
export type IndicatorHistoryQueryResult = Apollo.QueryResult<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>;