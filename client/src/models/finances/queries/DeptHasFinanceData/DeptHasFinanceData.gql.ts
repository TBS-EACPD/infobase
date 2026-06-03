import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptHasFinanceDataQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
}>;


export type DeptHasFinanceDataQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, has_finance_data?: boolean | null } | null } };


export const DeptHasFinanceDataDocument = gql`
    query DeptHasFinanceData($lang: String!, $org_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      id
      has_finance_data
    }
  }
}
    `;

/**
 * __useDeptHasFinanceDataQuery__
 *
 * To run a query within a React component, call `useDeptHasFinanceDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptHasFinanceDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptHasFinanceDataQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *   },
 * });
 */
export function useDeptHasFinanceDataQuery(baseOptions: Apollo.QueryHookOptions<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>(DeptHasFinanceDataDocument, options);
      }
export function useDeptHasFinanceDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>(DeptHasFinanceDataDocument, options);
        }
export type DeptHasFinanceDataQueryHookResult = ReturnType<typeof useDeptHasFinanceDataQuery>;
export type DeptHasFinanceDataLazyQueryHookResult = ReturnType<typeof useDeptHasFinanceDataLazyQuery>;
export type DeptHasFinanceDataQueryResult = Apollo.QueryResult<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>;