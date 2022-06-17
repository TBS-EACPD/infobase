import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AllCovidMeasuresQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type AllCovidMeasuresQuery = { __typename?: 'Query', root: { __typename?: 'Root', covid_measures?: Array<{ __typename?: 'CovidMeasure', id?: string | null, name?: string | null } | null> | null } };


export const AllCovidMeasuresDocument = gql`
    query AllCovidMeasures($lang: String!) {
  root(lang: $lang) {
    covid_measures {
      id
      name
    }
  }
}
    `;

/**
 * __useAllCovidMeasuresQuery__
 *
 * To run a query within a React component, call `useAllCovidMeasuresQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCovidMeasuresQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCovidMeasuresQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useAllCovidMeasuresQuery(baseOptions: Apollo.QueryHookOptions<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>(AllCovidMeasuresDocument, options);
      }
export function useAllCovidMeasuresLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>(AllCovidMeasuresDocument, options);
        }
export type AllCovidMeasuresQueryHookResult = ReturnType<typeof useAllCovidMeasuresQuery>;
export type AllCovidMeasuresLazyQueryHookResult = ReturnType<typeof useAllCovidMeasuresLazyQuery>;
export type AllCovidMeasuresQueryResult = Apollo.QueryResult<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>;