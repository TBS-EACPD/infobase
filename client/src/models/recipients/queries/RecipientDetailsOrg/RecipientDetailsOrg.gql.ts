import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientDetailsOrgQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id?: Types.InputMaybe<Types.Scalars['String']>;
  year: Types.Scalars['String'];
  row_id: Types.Scalars['String'];
}>;


export type RecipientDetailsOrgQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipient_details?: Array<{ __typename?: 'RecipientDetails', id?: number | null, row_id?: string | null, year?: string | null, recipient?: string | null, org_id?: string | null, transfer_payment?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null } };


export const RecipientDetailsOrgDocument = gql`
    query RecipientDetailsOrg($lang: String!, $org_id: String, $year: String!, $row_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      recipient_details(year: $year, row_id: $row_id) {
        id
        row_id
        year
        recipient
        org_id
        transfer_payment
        city
        province
        country
        expenditure
      }
    }
  }
}
    `;

/**
 * __useRecipientDetailsOrgQuery__
 *
 * To run a query within a React component, call `useRecipientDetailsOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientDetailsOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientDetailsOrgQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *      year: // value for 'year'
 *      row_id: // value for 'row_id'
 *   },
 * });
 */
export function useRecipientDetailsOrgQuery(baseOptions: Apollo.QueryHookOptions<RecipientDetailsOrgQuery, RecipientDetailsOrgQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientDetailsOrgQuery, RecipientDetailsOrgQueryVariables>(RecipientDetailsOrgDocument, options);
      }
export function useRecipientDetailsOrgLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientDetailsOrgQuery, RecipientDetailsOrgQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientDetailsOrgQuery, RecipientDetailsOrgQueryVariables>(RecipientDetailsOrgDocument, options);
        }
export type RecipientDetailsOrgQueryHookResult = ReturnType<typeof useRecipientDetailsOrgQuery>;
export type RecipientDetailsOrgLazyQueryHookResult = ReturnType<typeof useRecipientDetailsOrgLazyQuery>;
export type RecipientDetailsOrgQueryResult = Apollo.QueryResult<RecipientDetailsOrgQuery, RecipientDetailsOrgQueryVariables>;