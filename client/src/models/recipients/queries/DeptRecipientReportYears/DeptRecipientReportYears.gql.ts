import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptRecipientReportYearsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type DeptRecipientReportYearsQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', years_with_recipient_data?: Array<string | null> | null } | null } };


export const DeptRecipientReportYearsDocument = gql`
    query DeptRecipientReportYears($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      years_with_recipient_data
    }
  }
}
    `;

/**
 * __useDeptRecipientReportYearsQuery__
 *
 * To run a query within a React component, call `useDeptRecipientReportYearsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptRecipientReportYearsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptRecipientReportYearsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeptRecipientReportYearsQuery(baseOptions: Apollo.QueryHookOptions<DeptRecipientReportYearsQuery, DeptRecipientReportYearsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptRecipientReportYearsQuery, DeptRecipientReportYearsQueryVariables>(DeptRecipientReportYearsDocument, options);
      }
export function useDeptRecipientReportYearsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptRecipientReportYearsQuery, DeptRecipientReportYearsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptRecipientReportYearsQuery, DeptRecipientReportYearsQueryVariables>(DeptRecipientReportYearsDocument, options);
        }
export type DeptRecipientReportYearsQueryHookResult = ReturnType<typeof useDeptRecipientReportYearsQuery>;
export type DeptRecipientReportYearsLazyQueryHookResult = ReturnType<typeof useDeptRecipientReportYearsLazyQuery>;
export type DeptRecipientReportYearsQueryResult = Apollo.QueryResult<DeptRecipientReportYearsQuery, DeptRecipientReportYearsQueryVariables>;