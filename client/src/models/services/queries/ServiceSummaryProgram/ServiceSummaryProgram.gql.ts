import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ServiceSummaryProgramQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id: Types.Scalars['String'];
}>;


export type ServiceSummaryProgramQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', id?: string | null, service_summary?: { __typename?: 'ServiceSummary', service_general_stats?: { __typename?: 'ServiceGeneralStats', report_years?: Array<string | null> | null, standard_years?: Array<string | null> | null, number_of_services?: number | null, number_of_online_enabled_services?: number | null, pct_of_standards_met_high_vol_services?: number | null, pct_of_online_client_interaction_pts?: number | null, num_of_subject_offering_services?: number | null, num_of_programs_offering_services?: number | null } | null, service_channels_summary?: Array<{ __typename?: 'ServiceChannelsSummary', subject_id?: string | null, year?: string | null, channel_id?: string | null, channel_value?: number | null } | null> | null, service_digital_status_summary?: Array<{ __typename?: 'ServiceDigitalStatusSummary', key?: string | null, key_desc?: string | null, subject_id?: string | null, can_online?: number | null, cannot_online?: number | null, not_applicable?: number | null } | null> | null, service_standards_summary?: Array<{ __typename?: 'ServiceStandardsSummary', subject_id?: string | null, year?: string | null, services_w_standards_count?: number | null, standards_count?: number | null, met_standards_count?: number | null } | null> | null, subject_offering_services_summary?: Array<{ __typename?: 'OrgsOfferingServicesSummary', subject_id?: string | null, number_of_services?: number | null, total_volume?: number | null } | null> | null } | null } | null } };


export const ServiceSummaryProgramDocument = gql`
    query ServiceSummaryProgram($lang: String!, $id: String!) {
  root(lang: $lang) {
    program(id: $id) {
      id
      service_summary {
        service_general_stats {
          report_years
          standard_years
          number_of_services
          number_of_online_enabled_services
          pct_of_standards_met_high_vol_services
          pct_of_online_client_interaction_pts
          num_of_subject_offering_services
          num_of_programs_offering_services
        }
        service_channels_summary {
          subject_id
          year
          channel_id
          channel_value
        }
        service_digital_status_summary {
          key
          key_desc
          subject_id
          can_online
          cannot_online
          not_applicable
        }
        service_standards_summary {
          subject_id
          year
          services_w_standards_count
          standards_count
          met_standards_count
        }
        subject_offering_services_summary {
          subject_id
          number_of_services
          total_volume
        }
      }
    }
  }
}
    `;

/**
 * __useServiceSummaryProgramQuery__
 *
 * To run a query within a React component, call `useServiceSummaryProgramQuery` and pass it any options that fit your needs.
 * When your component renders, `useServiceSummaryProgramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServiceSummaryProgramQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useServiceSummaryProgramQuery(baseOptions: Apollo.QueryHookOptions<ServiceSummaryProgramQuery, ServiceSummaryProgramQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ServiceSummaryProgramQuery, ServiceSummaryProgramQueryVariables>(ServiceSummaryProgramDocument, options);
      }
export function useServiceSummaryProgramLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ServiceSummaryProgramQuery, ServiceSummaryProgramQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ServiceSummaryProgramQuery, ServiceSummaryProgramQueryVariables>(ServiceSummaryProgramDocument, options);
        }
export type ServiceSummaryProgramQueryHookResult = ReturnType<typeof useServiceSummaryProgramQuery>;
export type ServiceSummaryProgramLazyQueryHookResult = ReturnType<typeof useServiceSummaryProgramLazyQuery>;
export type ServiceSummaryProgramQueryResult = Apollo.QueryResult<ServiceSummaryProgramQuery, ServiceSummaryProgramQueryVariables>;