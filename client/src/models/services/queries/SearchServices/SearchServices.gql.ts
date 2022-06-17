import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SearchServicesQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  search_phrase: Types.Scalars['String'];
}>;


export type SearchServicesQuery = { __typename?: 'Query', root: { __typename?: 'Root', search_services?: Array<{ __typename?: 'Service', id?: string | null, subject_type?: string | null, org_id?: string | null, name?: string | null } | null> | null } };


export const SearchServicesDocument = gql`
    query SearchServices($lang: String!, $search_phrase: String!) {
  root(lang: $lang) {
    search_services(search_phrase: $search_phrase) {
      id
      subject_type
      org_id
      name
    }
  }
}
    `;

/**
 * __useSearchServicesQuery__
 *
 * To run a query within a React component, call `useSearchServicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchServicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchServicesQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      search_phrase: // value for 'search_phrase'
 *   },
 * });
 */
export function useSearchServicesQuery(baseOptions: Apollo.QueryHookOptions<SearchServicesQuery, SearchServicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchServicesQuery, SearchServicesQueryVariables>(SearchServicesDocument, options);
      }
export function useSearchServicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchServicesQuery, SearchServicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchServicesQuery, SearchServicesQueryVariables>(SearchServicesDocument, options);
        }
export type SearchServicesQueryHookResult = ReturnType<typeof useSearchServicesQuery>;
export type SearchServicesLazyQueryHookResult = ReturnType<typeof useSearchServicesLazyQuery>;
export type SearchServicesQueryResult = Apollo.QueryResult<SearchServicesQuery, SearchServicesQueryVariables>;