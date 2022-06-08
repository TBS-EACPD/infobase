import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptHasServicesQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id: Types.Scalars['String'];
}>;


export type DeptHasServicesQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, has_services?: boolean | null } | null } };


export const DeptHasServicesDocument = gql`
    query DeptHasServices($lang: String!, $id: String!) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      has_services
    }
  }
}
    `;

/**
 * __useDeptHasServicesQuery__
 *
 * To run a query within a React component, call `useDeptHasServicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptHasServicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptHasServicesQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeptHasServicesQuery(baseOptions: Apollo.QueryHookOptions<DeptHasServicesQuery, DeptHasServicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptHasServicesQuery, DeptHasServicesQueryVariables>(DeptHasServicesDocument, options);
      }
export function useDeptHasServicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptHasServicesQuery, DeptHasServicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptHasServicesQuery, DeptHasServicesQueryVariables>(DeptHasServicesDocument, options);
        }
export type DeptHasServicesQueryHookResult = ReturnType<typeof useDeptHasServicesQuery>;
export type DeptHasServicesLazyQueryHookResult = ReturnType<typeof useDeptHasServicesLazyQuery>;
export type DeptHasServicesQueryResult = Apollo.QueryResult<DeptHasServicesQuery, DeptHasServicesQueryVariables>;