import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  orgId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type RecipientsQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipients?: Array<{ __typename?: 'Recipients', year?: string | null, department?: string | null, org_id?: string | null, program?: string | null, record_type?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null } };


export const RecipientsDocument = gql`
    query Recipients($lang: String!, $orgId: String) {
  root(lang: $lang) {
    org(org_id: $orgId) {
      recipients {
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
  }
}
    `;

/**
 * __useRecipientsQuery__
 *
 * To run a query within a React component, call `useRecipientsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useRecipientsQuery(baseOptions: Apollo.QueryHookOptions<RecipientsQuery, RecipientsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientsQuery, RecipientsQueryVariables>(RecipientsDocument, options);
      }
export function useRecipientsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientsQuery, RecipientsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientsQuery, RecipientsQueryVariables>(RecipientsDocument, options);
        }
export type RecipientsQueryHookResult = ReturnType<typeof useRecipientsQuery>;
export type RecipientsLazyQueryHookResult = ReturnType<typeof useRecipientsLazyQuery>;
export type RecipientsQueryResult = Apollo.QueryResult<RecipientsQuery, RecipientsQueryVariables>;