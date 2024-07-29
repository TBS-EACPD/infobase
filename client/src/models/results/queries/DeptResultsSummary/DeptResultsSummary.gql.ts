import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptResultsSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  orgId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type DeptResultsSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', crsos?: Array<{ __typename?: 'Crso', name?: string | null, results?: Array<{ __typename?: 'Result', doc?: string | null, name?: string | null, indicators?: Array<{ __typename?: 'Indicator', id?: string | null, name?: string | null, status_key?: string | null, actual_result?: string | null } | null> | null } | null> | null, programs?: Array<{ __typename?: 'Program', name?: string | null, results?: Array<{ __typename?: 'Result', doc?: string | null, name?: string | null, indicators?: Array<{ __typename?: 'Indicator', id?: string | null, name?: string | null, status_key?: string | null, actual_result?: string | null } | null> | null } | null> | null } | null> | null } | null> | null } | null } };


export const DeptResultsSummaryDocument = gql`
    query DeptResultsSummary($lang: String!, $orgId: String) {
  root(lang: $lang) {
    org(org_id: $orgId) {
      crsos {
        name
        results {
          doc
          name
          indicators {
            id
            name
            status_key
            actual_result
          }
        }
        programs {
          name
          results {
            doc
            name
            indicators {
              id
              name
              status_key
              actual_result
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useDeptResultsSummaryQuery__
 *
 * To run a query within a React component, call `useDeptResultsSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptResultsSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptResultsSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useDeptResultsSummaryQuery(baseOptions: Apollo.QueryHookOptions<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>(DeptResultsSummaryDocument, options);
      }
export function useDeptResultsSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>(DeptResultsSummaryDocument, options);
        }
export type DeptResultsSummaryQueryHookResult = ReturnType<typeof useDeptResultsSummaryQuery>;
export type DeptResultsSummaryLazyQueryHookResult = ReturnType<typeof useDeptResultsSummaryLazyQuery>;
export type DeptResultsSummaryQueryResult = Apollo.QueryResult<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>;