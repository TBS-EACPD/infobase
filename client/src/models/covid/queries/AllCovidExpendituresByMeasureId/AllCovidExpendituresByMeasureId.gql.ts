import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AllCovidExpendituresByMeasureIdQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  fiscal_year?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type AllCovidExpendituresByMeasureIdQuery = { __typename?: 'Query', root: { __typename?: 'Root', covid_expenditures_by_measure?: Array<{ __typename?: 'CovidMeasure', id?: string | null, covid_data?: Array<{ __typename?: 'CovidData', fiscal_year?: number | null, covid_expenditures?: Array<{ __typename?: 'CovidExpenditures', org_id?: string | null, vote?: number | null, stat?: number | null } | null> | null } | null> | null } | null> | null } };


export const AllCovidExpendituresByMeasureIdDocument = gql`
    query AllCovidExpendituresByMeasureId($lang: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    covid_expenditures_by_measure: covid_measures(fiscal_year: $fiscal_year) {
      id
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
    `;

/**
 * __useAllCovidExpendituresByMeasureIdQuery__
 *
 * To run a query within a React component, call `useAllCovidExpendituresByMeasureIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCovidExpendituresByMeasureIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCovidExpendituresByMeasureIdQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      fiscal_year: // value for 'fiscal_year'
 *   },
 * });
 */
export function useAllCovidExpendituresByMeasureIdQuery(baseOptions: Apollo.QueryHookOptions<AllCovidExpendituresByMeasureIdQuery, AllCovidExpendituresByMeasureIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllCovidExpendituresByMeasureIdQuery, AllCovidExpendituresByMeasureIdQueryVariables>(AllCovidExpendituresByMeasureIdDocument, options);
      }
export function useAllCovidExpendituresByMeasureIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllCovidExpendituresByMeasureIdQuery, AllCovidExpendituresByMeasureIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllCovidExpendituresByMeasureIdQuery, AllCovidExpendituresByMeasureIdQueryVariables>(AllCovidExpendituresByMeasureIdDocument, options);
        }
export type AllCovidExpendituresByMeasureIdQueryHookResult = ReturnType<typeof useAllCovidExpendituresByMeasureIdQuery>;
export type AllCovidExpendituresByMeasureIdLazyQueryHookResult = ReturnType<typeof useAllCovidExpendituresByMeasureIdLazyQuery>;
export type AllCovidExpendituresByMeasureIdQueryResult = Apollo.QueryResult<AllCovidExpendituresByMeasureIdQuery, AllCovidExpendituresByMeasureIdQueryVariables>;