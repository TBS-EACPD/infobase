import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AllCovidEstimatesByMeasureIdQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  fiscal_year?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type AllCovidEstimatesByMeasureIdQuery = { __typename?: 'Query', root: { __typename?: 'Root', covid_estimates_by_measure?: Array<{ __typename?: 'CovidMeasure', id?: string | null, covid_data?: Array<{ __typename?: 'CovidData', fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimates', org_id?: string | null, est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null } | null> | null } | null> | null } };


export const AllCovidEstimatesByMeasureIdDocument = gql`
    query AllCovidEstimatesByMeasureId($lang: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    covid_estimates_by_measure: covid_measures(fiscal_year: $fiscal_year) {
      id
      covid_data(fiscal_year: $fiscal_year) {
        fiscal_year
        covid_estimates {
          org_id
          est_doc
          vote
          stat
        }
      }
    }
  }
}
    `;

/**
 * __useAllCovidEstimatesByMeasureIdQuery__
 *
 * To run a query within a React component, call `useAllCovidEstimatesByMeasureIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCovidEstimatesByMeasureIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCovidEstimatesByMeasureIdQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useAllCovidEstimatesByMeasureIdQuery(baseOptions: Apollo.QueryHookOptions<AllCovidEstimatesByMeasureIdQuery, AllCovidEstimatesByMeasureIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllCovidEstimatesByMeasureIdQuery, AllCovidEstimatesByMeasureIdQueryVariables>(AllCovidEstimatesByMeasureIdDocument, options);
      }
export function useAllCovidEstimatesByMeasureIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllCovidEstimatesByMeasureIdQuery, AllCovidEstimatesByMeasureIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllCovidEstimatesByMeasureIdQuery, AllCovidEstimatesByMeasureIdQueryVariables>(AllCovidEstimatesByMeasureIdDocument, options);
        }
export type AllCovidEstimatesByMeasureIdQueryHookResult = ReturnType<typeof useAllCovidEstimatesByMeasureIdQuery>;
export type AllCovidEstimatesByMeasureIdLazyQueryHookResult = ReturnType<typeof useAllCovidEstimatesByMeasureIdLazyQuery>;
export type AllCovidEstimatesByMeasureIdQueryResult = Apollo.QueryResult<AllCovidEstimatesByMeasureIdQuery, AllCovidEstimatesByMeasureIdQueryVariables>;