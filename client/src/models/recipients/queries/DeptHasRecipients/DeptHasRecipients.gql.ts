import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeptHasRecipientsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type DeptHasRecipientsQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, has_recipients?: boolean | null } | null } };


export const DeptHasRecipientsDocument = gql`
    query DeptHasRecipients($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      has_recipients
    }
  }
}
    `;

/**
 * __useDeptHasRecipientsQuery__
 *
 * To run a query within a React component, call `useDeptHasRecipientsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeptHasRecipientsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeptHasRecipientsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeptHasRecipientsQuery(baseOptions: Apollo.QueryHookOptions<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>(DeptHasRecipientsDocument, options);
      }
export function useDeptHasRecipientsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>(DeptHasRecipientsDocument, options);
        }
export type DeptHasRecipientsQueryHookResult = ReturnType<typeof useDeptHasRecipientsQuery>;
export type DeptHasRecipientsLazyQueryHookResult = ReturnType<typeof useDeptHasRecipientsLazyQuery>;
export type DeptHasRecipientsQueryResult = Apollo.QueryResult<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>;