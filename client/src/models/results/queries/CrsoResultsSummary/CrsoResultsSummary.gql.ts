import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import { IndicatorSummaryFragmentDoc } from '../IndicatorSummary/IndicatorSummary.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CrsoResultsSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  crsoId?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type CrsoResultsSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', crso?: { __typename?: 'Crso', id?: string | null, name?: string | null, results?: Array<{ __typename?: 'Result', id?: string | null, doc?: string | null, name?: string | null, indicators?: Array<{ __typename?: 'Indicator', id?: string | null, name?: string | null, doc?: string | null, target_month?: number | null, target_year?: number | null, target_min?: string | null, actual_result?: string | null, status_key?: string | null, result_explanation?: string | null, methodology?: string | null, previous_year_target_min?: string | null, previous_year_actual_result?: string | null } | null> | null } | null> | null, programs?: Array<{ __typename?: 'Program', id?: string | null, name?: string | null, results?: Array<{ __typename?: 'Result', id?: string | null, doc?: string | null, name?: string | null, indicators?: Array<{ __typename?: 'Indicator', id?: string | null, name?: string | null, doc?: string | null, target_month?: number | null, target_year?: number | null, target_min?: string | null, actual_result?: string | null, status_key?: string | null, result_explanation?: string | null, methodology?: string | null, previous_year_target_min?: string | null, previous_year_actual_result?: string | null } | null> | null } | null> | null } | null> | null } | null } };


export const CrsoResultsSummaryDocument = gql`
    query CrsoResultsSummary($lang: String!, $crsoId: String) {
  root(lang: $lang) {
    crso(id: $crsoId) {
      id
      name
      results {
        id
        doc
        name
        indicators {
          ...IndicatorSummary
        }
      }
      programs {
        id
        name
        results {
          id
          doc
          name
          indicators {
            ...IndicatorSummary
          }
        }
      }
    }
  }
}
    ${IndicatorSummaryFragmentDoc}`;

/**
 * __useCrsoResultsSummaryQuery__
 *
 * To run a query within a React component, call `useCrsoResultsSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCrsoResultsSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCrsoResultsSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      crsoId: // value for 'crsoId'
 *   },
 * });
 */
export function useCrsoResultsSummaryQuery(baseOptions: Apollo.QueryHookOptions<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>(CrsoResultsSummaryDocument, options);
      }
export function useCrsoResultsSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>(CrsoResultsSummaryDocument, options);
        }
export type CrsoResultsSummaryQueryHookResult = ReturnType<typeof useCrsoResultsSummaryQuery>;
export type CrsoResultsSummaryLazyQueryHookResult = ReturnType<typeof useCrsoResultsSummaryLazyQuery>;
export type CrsoResultsSummaryQueryResult = Apollo.QueryResult<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>;