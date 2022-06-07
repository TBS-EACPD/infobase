import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrgCovidSummariesQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  org_id: Types.Scalars['String'];
}>;


export type OrgCovidSummariesQuery = { __typename?: 'Query', root: { __typename?: 'Root', org?: { __typename?: 'Org', id?: string | null, covid_summary?: Array<{ __typename?: 'CovidOrgSummary', id?: string | null, fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimatesSummary', est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null, covid_expenditures?: { __typename?: 'CovidExpendituresSummary', month_last_updated?: number | null, vote?: number | null, stat?: number | null } | null } | null> | null } | null } };


export const OrgCovidSummariesDocument = gql`
    query OrgCovidSummaries($lang: String!, $org_id: String!) {
  root(lang: $lang) {
    org(org_id: $org_id) {
      id
      covid_summary {
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
 * __useOrgCovidSummariesQuery__
 *
 * To run a query within a React component, call `useOrgCovidSummariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrgCovidSummariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrgCovidSummariesQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      org_id: // value for 'org_id'
 *   },
 * });
 */
export function useOrgCovidSummariesQuery(baseOptions: Apollo.QueryHookOptions<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>(OrgCovidSummariesDocument, options);
      }
export function useOrgCovidSummariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>(OrgCovidSummariesDocument, options);
        }
export type OrgCovidSummariesQueryHookResult = ReturnType<typeof useOrgCovidSummariesQuery>;
export type OrgCovidSummariesLazyQueryHookResult = ReturnType<typeof useOrgCovidSummariesLazyQuery>;
export type OrgCovidSummariesQueryResult = Apollo.QueryResult<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>;