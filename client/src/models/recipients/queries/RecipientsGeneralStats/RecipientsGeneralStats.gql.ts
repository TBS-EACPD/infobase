import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientsGeneralStatsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type RecipientsGeneralStatsQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipients_general_stats?: Array<{ __typename?: 'RecipientsGeneralStats', year?: string | null, org_id?: string | null, recipient?: string | null, total_exp?: number | null, num_transfer_payments?: number | null } | null> | null } | null } };


export const RecipientsGeneralStatsDocument = gql`
    query RecipientsGeneralStats($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      recipients_general_stats {
        year
        org_id
        recipient
        total_exp
        num_transfer_payments
      }
    }
  }
}
    `;

/**
 * __useRecipientsGeneralStatsQuery__
 *
 * To run a query within a React component, call `useRecipientsGeneralStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientsGeneralStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientsGeneralStatsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRecipientsGeneralStatsQuery(baseOptions: Apollo.QueryHookOptions<RecipientsGeneralStatsQuery, RecipientsGeneralStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientsGeneralStatsQuery, RecipientsGeneralStatsQueryVariables>(RecipientsGeneralStatsDocument, options);
      }
export function useRecipientsGeneralStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientsGeneralStatsQuery, RecipientsGeneralStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientsGeneralStatsQuery, RecipientsGeneralStatsQueryVariables>(RecipientsGeneralStatsDocument, options);
        }
export type RecipientsGeneralStatsQueryHookResult = ReturnType<typeof useRecipientsGeneralStatsQuery>;
export type RecipientsGeneralStatsLazyQueryHookResult = ReturnType<typeof useRecipientsGeneralStatsLazyQuery>;
export type RecipientsGeneralStatsQueryResult = Apollo.QueryResult<RecipientsGeneralStatsQuery, RecipientsGeneralStatsQueryVariables>;