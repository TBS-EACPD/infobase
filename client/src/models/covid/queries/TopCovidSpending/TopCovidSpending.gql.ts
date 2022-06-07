import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TopCovidSpendingQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  top_x?: Types.Scalars['Int'];
  fiscal_year: Types.Scalars['Int'];
}>;


export type TopCovidSpendingQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', id?: string | null, covid_summary?: Array<{ __typename?: 'CovidGovSummary', id?: string | null, fiscal_year?: number | null, top_spending_orgs?: Array<{ __typename?: 'Org', id?: string | null, name?: string | null, covid_summary?: Array<{ __typename?: 'CovidOrgSummary', fiscal_year?: number | null, covid_expenditures?: { __typename?: 'CovidExpendituresSummary', vote?: number | null, stat?: number | null } | null } | null> | null } | null> | null, top_spending_measures?: Array<{ __typename?: 'CovidMeasure', id?: string | null, name?: string | null, covid_data?: Array<{ __typename?: 'CovidData', fiscal_year?: number | null, covid_expenditures?: Array<{ __typename?: 'CovidExpenditures', org_id?: string | null, vote?: number | null, stat?: number | null } | null> | null } | null> | null } | null> | null } | null> | null } | null } };


export const TopCovidSpendingDocument = gql`
    query TopCovidSpending($lang: String!, $top_x: Int! = 4, $fiscal_year: Int!) {
  root(lang: $lang) {
    gov {
      id
      covid_summary(fiscal_year: $fiscal_year) {
        id
        fiscal_year
        top_spending_orgs(top_x: $top_x) {
          id
          name
          covid_summary(fiscal_year: $fiscal_year) {
            fiscal_year
            covid_expenditures {
              vote
              stat
            }
          }
        }
        top_spending_measures(top_x: $top_x) {
          id
          name
          covid_data(fiscal_year: $fiscal_year) {
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
}
    `;

/**
 * __useTopCovidSpendingQuery__
 *
 * To run a query within a React component, call `useTopCovidSpendingQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopCovidSpendingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopCovidSpendingQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      top_x: // value for 'top_x'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useTopCovidSpendingQuery(baseOptions: Apollo.QueryHookOptions<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>(TopCovidSpendingDocument, options);
      }
export function useTopCovidSpendingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>(TopCovidSpendingDocument, options);
        }
export type TopCovidSpendingQueryHookResult = ReturnType<typeof useTopCovidSpendingQuery>;
export type TopCovidSpendingLazyQueryHookResult = ReturnType<typeof useTopCovidSpendingLazyQuery>;
export type TopCovidSpendingQueryResult = Apollo.QueryResult<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>;