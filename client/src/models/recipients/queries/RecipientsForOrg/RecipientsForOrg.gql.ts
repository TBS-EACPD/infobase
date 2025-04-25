import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { RecipientsFragmentFragmentDoc } from '../../RecipientsFragment.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RecipientsForOrgQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type RecipientsForOrgQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', recipients?: Array<{ __typename?: 'Recipients', year?: string | null, department?: string | null, org_id?: string | null, program?: string | null, record_type?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null } | null> | null } | null } };


export const RecipientsForOrgDocument = gql`
    query RecipientsForOrg($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      recipients {
        ...RecipientsFragment
      }
    }
  }
}
    ${RecipientsFragmentFragmentDoc}`;

/**
 * __useRecipientsForOrgQuery__
 *
 * To run a query within a React component, call `useRecipientsForOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecipientsForOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecipientsForOrgQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRecipientsForOrgQuery(baseOptions: Apollo.QueryHookOptions<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>(RecipientsForOrgDocument, options);
      }
export function useRecipientsForOrgLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>(RecipientsForOrgDocument, options);
        }
export type RecipientsForOrgQueryHookResult = ReturnType<typeof useRecipientsForOrgQuery>;
export type RecipientsForOrgLazyQueryHookResult = ReturnType<typeof useRecipientsForOrgLazyQuery>;
export type RecipientsForOrgQueryResult = Apollo.QueryResult<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>;