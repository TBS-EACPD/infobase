import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovYearsWithCovidDataQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type GovYearsWithCovidDataQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', id?: string | null, years_with_covid_data?: { __typename?: 'YearsWithCovidData', years_with_estimates?: Array<number | null> | null, years_with_expenditures?: Array<number | null> | null } | null } | null } };


export const GovYearsWithCovidDataDocument = gql`
    query GovYearsWithCovidData($lang: String!) {
  root(lang: $lang) {
    gov {
      id
      years_with_covid_data {
        years_with_estimates
        years_with_expenditures
      }
    }
  }
}
    `;

/**
 * __useGovYearsWithCovidDataQuery__
 *
 * To run a query within a React component, call `useGovYearsWithCovidDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovYearsWithCovidDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovYearsWithCovidDataQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGovYearsWithCovidDataQuery(baseOptions: Apollo.QueryHookOptions<GovYearsWithCovidDataQuery, GovYearsWithCovidDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovYearsWithCovidDataQuery, GovYearsWithCovidDataQueryVariables>(GovYearsWithCovidDataDocument, options);
      }
export function useGovYearsWithCovidDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovYearsWithCovidDataQuery, GovYearsWithCovidDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovYearsWithCovidDataQuery, GovYearsWithCovidDataQueryVariables>(GovYearsWithCovidDataDocument, options);
        }
export type GovYearsWithCovidDataQueryHookResult = ReturnType<typeof useGovYearsWithCovidDataQuery>;
export type GovYearsWithCovidDataLazyQueryHookResult = ReturnType<typeof useGovYearsWithCovidDataLazyQuery>;
export type GovYearsWithCovidDataQueryResult = Apollo.QueryResult<GovYearsWithCovidDataQuery, GovYearsWithCovidDataQueryVariables>;