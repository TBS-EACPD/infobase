import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientSummaryGovQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type RecipientSummaryGovQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', recipient_summary?: { __typename?: 'RecipientSummary', id?: string | null, recipient_overview?: Array<{ __typename?: 'RecipientOverview', year?: string | null, total_tf_exp?: number | null } | null> | null, recipient_exp_summary?: Array<{ __typename?: 'RecipientExpSummary', year?: string | null, recipient?: string | null, total_exp?: number | null, num_transfer_payments?: number | null, transfer_payments?: Array<{ __typename?: 'Recipients', year?: string | null, department?: string | null, org_id?: string | null, program?: string | null, record_type?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null> | null, recipient_location?: Array<{ __typename?: 'RecipientLocation', year?: string | null, qc?: number | null, nb?: number | null, bc?: number | null, on?: number | null, ns?: number | null, mb?: number | null, nl?: number | null, nu?: number | null, na?: number | null, pe?: number | null, nt?: number | null, yk?: number | null, abroad?: number | null, sk?: number | null, ab?: number | null } | null> | null } | null } | null } };


export const RecipientSummaryGovDocument = gql`
    query RecipientSummaryGov($lang: String!) {
  root(lang: $lang) {
    gov {
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
          transfer_payments {
            year
            department
            org_id
            program
            record_type
            recipient
            city
            province
            country
            expenditure
          }
        }
        recipient_location {
          year
          qc
          nb
          bc
          on
          ns
          mb
          nl
          nu
          na
          pe
          nt
          yk
          abroad
          sk
          ab
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