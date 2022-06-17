import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovCovidSummaryQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  fiscal_year: Types.Scalars['Int'];
}>;


export type GovCovidSummaryQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', id?: string | null, covid_summary?: Array<{ __typename?: 'CovidGovSummary', id?: string | null, fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimatesSummary', est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null, covid_expenditures?: { __typename?: 'CovidExpendituresSummary', month_last_updated?: number | null, vote?: number | null, stat?: number | null } | null } | null> | null } | null } };


export const GovCovidSummaryDocument = gql`
    query GovCovidSummary($lang: String!, $fiscal_year: Int!) {
  root(lang: $lang) {
    gov {
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
 * __useGovCovidSummaryQuery__
 *
 * To run a query within a React component, call `useGovCovidSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovCovidSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovCovidSummaryQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useGovCovidSummaryQuery(baseOptions: Apollo.QueryHookOptions<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>(GovCovidSummaryDocument, options);
      }
export function useGovCovidSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>(GovCovidSummaryDocument, options);
        }
export type GovCovidSummaryQueryHookResult = ReturnType<typeof useGovCovidSummaryQuery>;
export type GovCovidSummaryLazyQueryHookResult = ReturnType<typeof useGovCovidSummaryLazyQuery>;
export type GovCovidSummaryQueryResult = Apollo.QueryResult<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>;