import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovPeopleSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type GovPeopleSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', people_data?: { __typename?: 'GovPeopleSummary', id?: string | null, average_age?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null, type?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, region?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, age_group?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, ex_lvl?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, gender?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null, fol?: Array<{ __typename?: 'SummaryHeadcountData', dimension?: string | null, avg_share?: number | null, yearly_data?: Array<{ __typename?: 'YearlyData', year?: number | null, value?: number | null } | null> | null } | null> | null } | null } | null } };


export const GovPeopleSummaryDocument = gql`
    query GovPeopleSummary($lang: String!) {
  root(lang: $lang) {
    gov {
      people_data {
        id
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
 * __useGovPeopleSummaryQuery__
 *
 * To run a query within a React component, call `useGovPeopleSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovPeopleSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovPeopleSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGovPeopleSummaryQuery(baseOptions: Apollo.QueryHookOptions<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>(GovPeopleSummaryDocument, options);
      }
export function useGovPeopleSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>(GovPeopleSummaryDocument, options);
        }
export type GovPeopleSummaryQueryHookResult = ReturnType<typeof useGovPeopleSummaryQuery>;
export type GovPeopleSummaryLazyQueryHookResult = ReturnType<typeof useGovPeopleSummaryLazyQuery>;
export type GovPeopleSummaryQueryResult = Apollo.QueryResult<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>;