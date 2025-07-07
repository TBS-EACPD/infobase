import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientSummaryGovQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  year: Types.Scalars['String'];
}>;


export type RecipientSummaryGovQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', recipient_summary?: { __typename?: 'TopTen', id?: string | null, year?: string | null, total_exp?: number | null, top_ten?: Array<{ __typename?: 'TopTenSummary', row_id?: string | null, recipient?: string | null, total_exp?: number | null, num_transfer_payments?: number | null, transfer_payments?: Array<{ __typename?: 'Recipients', program?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null> | null } | null } | null } };


export const RecipientSummaryGovDocument = gql`
    query RecipientSummaryGov($lang: String!, $year: String!) {
  root(lang: $lang) {
    gov {
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
 * __useRecipientSummaryGovQuery__
 *
 * To run a query within a React component, call `useRecipientSummaryGovQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientSummaryGovQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientSummaryGovQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useRecipientSummaryGovQuery(baseOptions: Apollo.QueryHookOptions<RecipientSummaryGovQuery, RecipientSummaryGovQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientSummaryGovQuery, RecipientSummaryGovQueryVariables>(RecipientSummaryGovDocument, options);
      }
export function useRecipientSummaryGovLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientSummaryGovQuery, RecipientSummaryGovQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientSummaryGovQuery, RecipientSummaryGovQueryVariables>(RecipientSummaryGovDocument, options);
        }
export type RecipientSummaryGovQueryHookResult = ReturnType<typeof useRecipientSummaryGovQuery>;
export type RecipientSummaryGovLazyQueryHookResult = ReturnType<typeof useRecipientSummaryGovLazyQuery>;
export type RecipientSummaryGovQueryResult = Apollo.QueryResult<RecipientSummaryGovQuery, RecipientSummaryGovQueryVariables>;