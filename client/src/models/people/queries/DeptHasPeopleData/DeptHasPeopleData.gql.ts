import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptHasPeopleDataQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id: Types.Scalars['String'];
}>;


export type DeptHasPeopleDataQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, has_people_data?: boolean | null } | null } };


export const DeptHasPeopleDataDocument = gql`
    query DeptHasPeopleData($lang: String!, $id: String!) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      has_people_data
    }
  }
}
    `;

/**
 * __useDeptHasPeopleDataQuery__
 *
 * To run a query within a React component, call `useDeptHasPeopleDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptHasPeopleDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptHasPeopleDataQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeptHasPeopleDataQuery(baseOptions: Apollo.QueryHookOptions<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>(DeptHasPeopleDataDocument, options);
      }
export function useDeptHasPeopleDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>(DeptHasPeopleDataDocument, options);
        }
export type DeptHasPeopleDataQueryHookResult = ReturnType<typeof useDeptHasPeopleDataQuery>;
export type DeptHasPeopleDataLazyQueryHookResult = ReturnType<typeof useDeptHasPeopleDataLazyQuery>;
export type DeptHasPeopleDataQueryResult = Apollo.QueryResult<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>;