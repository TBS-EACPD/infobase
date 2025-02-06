import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgPeopleSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
}>;


export type OrgPeopleSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', people_data?: { __typename?: 'OrgPeopleData', org_id?: string | null, average_age?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null, type?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, region?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, age_group?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, ex_lvl?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, gender?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, fol?: Array<{ __typename?: 'OrgHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null } | null } | null } };


export const OrgPeopleSummaryDocument = gql`
    query OrgPeopleSummary($lang: String!, $org_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      people_data {
        org_id
        average_age {
          year
          value
        }
        type {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
        region {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
        age_group {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
        ex_lvl {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
        gender {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
        fol {
          dimension
          yearly_data {
            year
            value
          }
          avg_share
        }
      }
    }
  }
}
    `;

/**
 * __useOrgPeopleSummaryQuery__
 *
 * To run a query within a React component, call `useOrgPeopleSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgPeopleSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgPeopleSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *   },
 * });
 */
export function useOrgPeopleSummaryQuery(baseOptions: Apollo.QueryHookOptions<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>(OrgPeopleSummaryDocument, options);
      }
export function useOrgPeopleSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>(OrgPeopleSummaryDocument, options);
        }
export type OrgPeopleSummaryQueryHookResult = ReturnType<typeof useOrgPeopleSummaryQuery>;
export type OrgPeopleSummaryLazyQueryHookResult = ReturnType<typeof useOrgPeopleSummaryLazyQuery>;
export type OrgPeopleSummaryQueryResult = Apollo.QueryResult<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>;