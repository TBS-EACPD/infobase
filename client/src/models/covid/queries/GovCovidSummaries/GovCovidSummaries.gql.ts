import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovCovidSummariesQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type GovCovidSummariesQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', id?: string | null, covid_summary?: Array<{ __typename?: 'CovidGovSummary', id?: string | null, fiscal_year?: number | null, covid_estimates?: Array<{ __typename?: 'CovidEstimatesSummary', est_doc?: string | null, vote?: number | null, stat?: number | null } | null> | null, covid_expenditures?: { __typename?: 'CovidExpendituresSummary', month_last_updated?: number | null, vote?: number | null, stat?: number | null } | null } | null> | null } | null } };


export const GovCovidSummariesDocument = gql`
    query GovCovidSummaries($lang: String!) {
  root(lang: $lang) {
    gov {
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
 * __useGovCovidSummariesQuery__
 *
 * To run a query within a React component, call `useGovCovidSummariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovCovidSummariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovCovidSummariesQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGovCovidSummariesQuery(baseOptions: Apollo.QueryHookOptions<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>(GovCovidSummariesDocument, options);
      }
export function useGovCovidSummariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>(GovCovidSummariesDocument, options);
        }
export type GovCovidSummariesQueryHookResult = ReturnType<typeof useGovCovidSummariesQuery>;
export type GovCovidSummariesLazyQueryHookResult = ReturnType<typeof useGovCovidSummariesLazyQuery>;
export type GovCovidSummariesQueryResult = Apollo.QueryResult<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>;