import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgCovidEstimatesByMeasureIdQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
  fiscal_year?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type OrgCovidEstimatesByMeasureIdQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, covid_estimates_by_measure?: Array<{ __typename?: 'CovidMeasure', id?: string | null, covid_data?: Array<{ __typename?: 'CovidData', fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimates', org_id?: string | null, est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null } | null> | null } | null> | null } | null } };


export const OrgCovidEstimatesByMeasureIdDocument = gql`
    query OrgCovidEstimatesByMeasureId($lang: String!, $org_id: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      id
      covid_estimates_by_measure: covid_measures(fiscal_year: $fiscal_year) {
        id
        covid_data(fiscal_year: $fiscal_year, org_id: $org_id) {
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
}
    `;

/**
 * __useOrgCovidEstimatesByMeasureIdQuery__
 *
 * To run a query within a React component, call `useOrgCovidEstimatesByMeasureIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgCovidEstimatesByMeasureIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgCovidEstimatesByMeasureIdQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useOrgCovidEstimatesByMeasureIdQuery(baseOptions: Apollo.QueryHookOptions<OrgCovidEstimatesByMeasureIdQuery, OrgCovidEstimatesByMeasureIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgCovidEstimatesByMeasureIdQuery, OrgCovidEstimatesByMeasureIdQueryVariables>(OrgCovidEstimatesByMeasureIdDocument, options);
      }
export function useOrgCovidEstimatesByMeasureIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgCovidEstimatesByMeasureIdQuery, OrgCovidEstimatesByMeasureIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgCovidEstimatesByMeasureIdQuery, OrgCovidEstimatesByMeasureIdQueryVariables>(OrgCovidEstimatesByMeasureIdDocument, options);
        }
export type OrgCovidEstimatesByMeasureIdQueryHookResult = ReturnType<typeof useOrgCovidEstimatesByMeasureIdQuery>;
export type OrgCovidEstimatesByMeasureIdLazyQueryHookResult = ReturnType<typeof useOrgCovidEstimatesByMeasureIdLazyQuery>;
export type OrgCovidEstimatesByMeasureIdQueryResult = Apollo.QueryResult<OrgCovidEstimatesByMeasureIdQuery, OrgCovidEstimatesByMeasureIdQueryVariables>;