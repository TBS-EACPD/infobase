import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientSummaryOrgQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
  year: Types.Scalars['String'];
}>;


export type RecipientSummaryOrgQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipient_summary?: { __typename?: 'TopTen', id?: string | null, year?: string | null, total_exp?: number | null, top_ten?: Array<{ __typename?: 'TopTenSummary', row_id?: string | null, recipient?: string | null, total_exp?: number | null, num_transfer_payments?: number | null, transfer_payments?: Array<{ __typename?: 'Recipients', program?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null> | null } | null } | null } };


export const RecipientSummaryOrgDocument = gql`
    query RecipientSummaryOrg($lang: String!, $id: String, $year: String!) {
  root(lang: $lang) {
    org(org_id: $id) {
      recipient_summary(year: $year) {
        id
        year
        total_exp
        top_ten {
          row_id
          recipient
          total_exp
          num_transfer_payments
          transfer_payments {
            program
            recipient
            city
            province
            country
            expenditure
          }
        }
      }
    }
  }
}
    `;

/**
 * __useRecipientSummaryOrgQuery__
 *
 * To run a query within a React component, call `useRecipientSummaryOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientSummaryOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientSummaryOrgQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useRecipientSummaryOrgQuery(baseOptions: Apollo.QueryHookOptions<RecipientSummaryOrgQuery, RecipientSummaryOrgQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientSummaryOrgQuery, RecipientSummaryOrgQueryVariables>(RecipientSummaryOrgDocument, options);
      }
export function useRecipientSummaryOrgLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientSummaryOrgQuery, RecipientSummaryOrgQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientSummaryOrgQuery, RecipientSummaryOrgQueryVariables>(RecipientSummaryOrgDocument, options);
        }
export type RecipientSummaryOrgQueryHookResult = ReturnType<typeof useRecipientSummaryOrgQuery>;
export type RecipientSummaryOrgLazyQueryHookResult = ReturnType<typeof useRecipientSummaryOrgLazyQuery>;
export type RecipientSummaryOrgQueryResult = Apollo.QueryResult<RecipientSummaryOrgQuery, RecipientSummaryOrgQueryVariables>;