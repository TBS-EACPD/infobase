import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GovRecipientReportYearsQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
}>;


export type GovRecipientReportYearsQuery = { __typename?: 'Query', root: { __typename?: 'Root', gov?: { __typename?: 'Gov', years_with_recipient_data?: Array<string | null> | null } | null } };


export const GovRecipientReportYearsDocument = gql`
    query GovRecipientReportYears($lang: String!) {
  root(lang: $lang) {
    gov {
      years_with_recipient_data
    }
  }
}
    `;

/**
 * __useGovRecipientReportYearsQuery__
 *
 * To run a query within a React component, call `useGovRecipientReportYearsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGovRecipientReportYearsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGovRecipientReportYearsQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGovRecipientReportYearsQuery(baseOptions: Apollo.QueryHookOptions<GovRecipientReportYearsQuery, GovRecipientReportYearsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GovRecipientReportYearsQuery, GovRecipientReportYearsQueryVariables>(GovRecipientReportYearsDocument, options);
      }
export function useGovRecipientReportYearsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GovRecipientReportYearsQuery, GovRecipientReportYearsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GovRecipientReportYearsQuery, GovRecipientReportYearsQueryVariables>(GovRecipientReportYearsDocument, options);
        }
export type GovRecipientReportYearsQueryHookResult = ReturnType<typeof useGovRecipientReportYearsQuery>;
export type GovRecipientReportYearsLazyQueryHookResult = ReturnType<typeof useGovRecipientReportYearsLazyQuery>;
export type GovRecipientReportYearsQueryResult = Apollo.QueryResult<GovRecipientReportYearsQuery, GovRecipientReportYearsQueryVariables>;