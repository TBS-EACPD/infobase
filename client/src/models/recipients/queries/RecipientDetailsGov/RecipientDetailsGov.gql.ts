import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientDetailsGovQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  year: Types.Scalars['String'];
  row_id: Types.Scalars['String'];
}>;


export type RecipientDetailsGovQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', recipient_details?: Array<{ __typename?: 'RecipientDetails', id?: number | null, row_id?: string | null, year?: string | null, recipient?: string | null, org_id?: string | null, transfer_payment?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null } };


export const RecipientDetailsGovDocument = gql`
    query RecipientDetailsGov($lang: String!, $year: String!, $row_id: String!) {
  root(lang: $lang) {
    gov {
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
 * __useRecipientDetailsGovQuery__
 *
 * To run a query within a React component, call `useRecipientDetailsGovQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientDetailsGovQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientDetailsGovQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      year: // value for 'year'
 *      row_id: // value for 'row_id'
 *   },
 * });
 */
export function useRecipientDetailsGovQuery(baseOptions: Apollo.QueryHookOptions<RecipientDetailsGovQuery, RecipientDetailsGovQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientDetailsGovQuery, RecipientDetailsGovQueryVariables>(RecipientDetailsGovDocument, options);
      }
export function useRecipientDetailsGovLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientDetailsGovQuery, RecipientDetailsGovQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientDetailsGovQuery, RecipientDetailsGovQueryVariables>(RecipientDetailsGovDocument, options);
        }
export type RecipientDetailsGovQueryHookResult = ReturnType<typeof useRecipientDetailsGovQuery>;
export type RecipientDetailsGovLazyQueryHookResult = ReturnType<typeof useRecipientDetailsGovLazyQuery>;
export type RecipientDetailsGovQueryResult = Apollo.QueryResult<RecipientDetailsGovQuery, RecipientDetailsGovQueryVariables>;