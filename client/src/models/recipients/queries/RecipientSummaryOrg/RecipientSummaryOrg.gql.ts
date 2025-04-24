import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientSummaryOrgQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type RecipientSummaryOrgQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipient_summary?: { __typename?: 'RecipientSummary', id?: string | null, recipient_overview?: Array<{ __typename?: 'RecipientOverview', year?: string | null, total_tf_exp?: number | null } | null> | null, recipient_exp_summary?: Array<{ __typename?: 'RecipientExpSummary', year?: string | null, recipient?: string | null, total_exp?: number | null, num_transfer_payments?: number | null } | null> | null } | null } | null } };


export const RecipientSummaryOrgDocument = gql`
    query RecipientSummaryOrg($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      recipient_summary {
        id
        recipient_overview {
          year
          total_tf_exp
        }
        recipient_exp_summary {
          year
          recipient
          total_exp
          num_transfer_payments
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