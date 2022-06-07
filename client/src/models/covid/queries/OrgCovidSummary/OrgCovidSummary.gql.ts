import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgCovidSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
  fiscal_year: Types.Scalars['Int'];
}>;


export type OrgCovidSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, covid_summary?: Array<{ __typename?: 'CovidOrgSummary', id?: string | null, fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimatesSummary', est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null, covid_expenditures?: { __typename?: 'CovidExpendituresSummary', month_last_updated?: number | null, vote?: number | null, stat?: number | null } | null } | null> | null } | null } };


export const OrgCovidSummaryDocument = gql`
    query OrgCovidSummary($lang: String!, $org_id: String!, $fiscal_year: Int!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      id
      covid_summary(fiscal_year: $fiscal_year) {
        id
        fiscal_year
        covid_estimates {
          est_doc
          vote
          stat
        }
        covid_expenditures {
          month_last_updated
          vote
          stat
        }
      }
    }
  }
}
    `;

/**
 * __useOrgCovidSummaryQuery__
 *
 * To run a query within a React component, call `useOrgCovidSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgCovidSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgCovidSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useOrgCovidSummaryQuery(baseOptions: Apollo.QueryHookOptions<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>(OrgCovidSummaryDocument, options);
      }
export function useOrgCovidSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>(OrgCovidSummaryDocument, options);
        }
export type OrgCovidSummaryQueryHookResult = ReturnType<typeof useOrgCovidSummaryQuery>;
export type OrgCovidSummaryLazyQueryHookResult = ReturnType<typeof useOrgCovidSummaryLazyQuery>;
export type OrgCovidSummaryQueryResult = Apollo.QueryResult<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>;