import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovDrrIndicatorsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  doc: Types.Scalars['String'];
}>;


export type GovDrrIndicatorsQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', departmental_result_indicators?: Array<{ __typename?: 'Indicator', doc?: string | null, target_type?: string | null, target_min?: string | null, target_max?: string | null, seeking_to?: string | null, actual_result?: string | null, status_key?: string | null, previous_year_target_type?: string | null } | null> | null } | null } };


export const GovDrrIndicatorsDocument = gql`
    query GovDrrIndicators($lang: String!, $doc: String!) {
  root(lang: $lang) {
    gov {
      departmental_result_indicators(doc: $doc) {
        doc
        target_type
        target_min
        target_max
        seeking_to
        actual_result
        status_key
        previous_year_target_type
      }
    }
  }
}
    `;

/**
 * __useGovDrrIndicatorsQuery__
 *
 * To run a query within a React component, call `useGovDrrIndicatorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovDrrIndicatorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovDrrIndicatorsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      doc: // value for 'doc'
 *   },
 * });
 */
export function useGovDrrIndicatorsQuery(baseOptions: Apollo.QueryHookOptions<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>(GovDrrIndicatorsDocument, options);
      }
export function useGovDrrIndicatorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>(GovDrrIndicatorsDocument, options);
        }
export type GovDrrIndicatorsQueryHookResult = ReturnType<typeof useGovDrrIndicatorsQuery>;
export type GovDrrIndicatorsLazyQueryHookResult = ReturnType<typeof useGovDrrIndicatorsLazyQuery>;
export type GovDrrIndicatorsQueryResult = Apollo.QueryResult<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>;