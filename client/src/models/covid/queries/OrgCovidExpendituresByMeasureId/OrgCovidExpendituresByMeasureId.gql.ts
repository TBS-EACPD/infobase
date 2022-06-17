import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgCovidExpendituresByMeasureIdQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
  fiscal_year?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type OrgCovidExpendituresByMeasureIdQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, covid_expenditures_by_measure?: Array<{ __typename?: 'CovidMeasure', id?: string | null, covid_data?: Array<{ __typename?: 'CovidData', fiscal_year?: number | null, covid_expenditures?: Array<{ __typename?: 'CovidExpenditures', org_id?: string | null, vote?: number | null, stat?: number | null } | null> | null } | null> | null } | null> | null } | null } };


export const OrgCovidExpendituresByMeasureIdDocument = gql`
    query OrgCovidExpendituresByMeasureId($lang: String!, $org_id: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      id
      covid_expenditures_by_measure: covid_measures(fiscal_year: $fiscal_year) {
        id
        covid_data(fiscal_year: $fiscal_year, org_id: $org_id) {
          fiscal_year
          covid_expenditures {
            org_id
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
 * __useOrgCovidExpendituresByMeasureIdQuery__
 *
 * To run a query within a React component, call `useOrgCovidExpendituresByMeasureIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgCovidExpendituresByMeasureIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgCovidExpendituresByMeasureIdQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useOrgCovidExpendituresByMeasureIdQuery(baseOptions: Apollo.QueryHookOptions<OrgCovidExpendituresByMeasureIdQuery, OrgCovidExpendituresByMeasureIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgCovidExpendituresByMeasureIdQuery, OrgCovidExpendituresByMeasureIdQueryVariables>(OrgCovidExpendituresByMeasureIdDocument, options);
      }
export function useOrgCovidExpendituresByMeasureIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgCovidExpendituresByMeasureIdQuery, OrgCovidExpendituresByMeasureIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgCovidExpendituresByMeasureIdQuery, OrgCovidExpendituresByMeasureIdQueryVariables>(OrgCovidExpendituresByMeasureIdDocument, options);
        }
export type OrgCovidExpendituresByMeasureIdQueryHookResult = ReturnType<typeof useOrgCovidExpendituresByMeasureIdQuery>;
export type OrgCovidExpendituresByMeasureIdLazyQueryHookResult = ReturnType<typeof useOrgCovidExpendituresByMeasureIdLazyQuery>;
export type OrgCovidExpendituresByMeasureIdQueryResult = Apollo.QueryResult<OrgCovidExpendituresByMeasureIdQuery, OrgCovidExpendituresByMeasureIdQueryVariables>;