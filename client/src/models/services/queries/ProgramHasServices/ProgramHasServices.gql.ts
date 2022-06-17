import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProgramHasServicesQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id: Types.Scalars['String'];
}>;


export type ProgramHasServicesQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', id?: string | null, has_services?: boolean | null } | null } };


export const ProgramHasServicesDocument = gql`
    query ProgramHasServices($lang: String!, $id: String!) {
  root(lang: $lang) {
    program(id: $id) {
      id
      has_services
    }
  }
}
    `;

/**
 * __useProgramHasServicesQuery__
 *
 * To run a query within a React component, call `useProgramHasServicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useProgramHasServicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProgramHasServicesQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProgramHasServicesQuery(baseOptions: Apollo.QueryHookOptions<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>(ProgramHasServicesDocument, options);
      }
export function useProgramHasServicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>(ProgramHasServicesDocument, options);
        }
export type ProgramHasServicesQueryHookResult = ReturnType<typeof useProgramHasServicesQuery>;
export type ProgramHasServicesLazyQueryHookResult = ReturnType<typeof useProgramHasServicesLazyQuery>;
export type ProgramHasServicesQueryResult = Apollo.QueryResult<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>;