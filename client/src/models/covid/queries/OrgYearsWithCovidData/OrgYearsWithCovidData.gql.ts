import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgYearsWithCovidDataQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
}>;


export type OrgYearsWithCovidDataQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, years_with_covid_data?: { __typename?: 'YearsWithCovidData', years_with_estimates?: Array<number | null> | null, years_with_expenditures?: Array<number | null> | null } | null } | null } };


export const OrgYearsWithCovidDataDocument = gql`
    query OrgYearsWithCovidData($lang: String!, $org_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
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
 * __useOrgYearsWithCovidDataQuery__
 *
 * To run a query within a React component, call `useOrgYearsWithCovidDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgYearsWithCovidDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgYearsWithCovidDataQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *   },
 * });
 */
export function useOrgYearsWithCovidDataQuery(baseOptions: Apollo.QueryHookOptions<OrgYearsWithCovidDataQuery, OrgYearsWithCovidDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgYearsWithCovidDataQuery, OrgYearsWithCovidDataQueryVariables>(OrgYearsWithCovidDataDocument, options);
      }
export function useOrgYearsWithCovidDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgYearsWithCovidDataQuery, OrgYearsWithCovidDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgYearsWithCovidDataQuery, OrgYearsWithCovidDataQueryVariables>(OrgYearsWithCovidDataDocument, options);
        }
export type OrgYearsWithCovidDataQueryHookResult = ReturnType<typeof useOrgYearsWithCovidDataQuery>;
export type OrgYearsWithCovidDataLazyQueryHookResult = ReturnType<typeof useOrgYearsWithCovidDataLazyQuery>;
export type OrgYearsWithCovidDataQueryResult = Apollo.QueryResult<OrgYearsWithCovidDataQuery, OrgYearsWithCovidDataQueryVariables>;