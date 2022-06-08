import * as Types from '../../../../types.gql';

import { gql } from '@apollo/client';
import { StandardServiceFragmentFragmentDoc } from '../StandardServiceFragment.gql';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ServicesForProgramQueryVariables = Types.Exact<{
  lang: Types.Scalars['String'];
  id: Types.Scalars['String'];
}>;


export type ServicesForProgramQuery = { __typename?: 'Query', root: { __typename?: 'Root', program?: { __typename?: 'Program', id?: string | null, services?: Array<{ __typename?: 'Service', id?: string | null, subject_type?: string | null, org_id?: string | null, submission_year?: string | null, is_active?: boolean | null, report_years?: Array<string | null> | null, program_activity_codes?: Array<string | null> | null, first_active_year?: string | null, last_active_year?: string | null, name?: string | null, description?: string | null, service_type?: Array<string | null> | null, scope?: Array<string | null> | null, designations?: Array<string | null> | null, target_groups?: Array<string | null> | null, feedback_channels?: Array<string | null> | null, urls?: Array<string | null> | null, digital_identity_platforms?: Array<string | null> | null, accessibility_assessors?: Array<string | null> | null, recipient_type?: Array<string | null> | null, last_gender_analysis?: string | null, last_accessibility_review?: string | null, last_improve_from_feedback?: string | null, collects_fees?: boolean | null, account_reg_digital_status?: boolean | null, authentication_status?: boolean | null, application_digital_status?: boolean | null, decision_digital_status?: boolean | null, issuance_digital_status?: boolean | null, issue_res_digital_status?: boolean | null, digital_enablement_comment?: string | null, service_report?: Array<{ __typename?: 'ServiceReport', service_id?: string | null, year?: string | null, cra_business_ids_collected?: boolean | null, sin_collected?: boolean | null, phone_inquiry_count?: number | null, online_inquiry_count?: number | null, online_application_count?: number | null, live_application_count?: number | null, mail_application_count?: number | null, phone_application_count?: number | null, other_application_count?: number | null, email_application_count?: number | null, fax_application_count?: number | null, phone_inquiry_and_application_count?: number | null, service_report_comment?: string | null } | null> | null, standards?: Array<{ __typename?: 'ServiceStandard', standard_id?: string | null, service_id?: string | null, name?: string | null, submission_year?: string | null, first_active_year?: string | null, last_active_year?: string | null, last_gcss_tool_year?: string | null, channel?: string | null, type?: string | null, other_type_comment?: string | null, target_type?: string | null, standard_urls?: Array<string | null> | null, rtp_urls?: Array<string | null> | null, standard_report?: Array<{ __typename?: 'StandardReport', standard_id?: string | null, year?: string | null, lower?: number | null, upper?: number | null, count?: number | null, met_count?: number | null, is_target_met?: boolean | null, standard_report_comment?: string | null } | null> | null } | null> | null } | null> | null } | null } };


export const ServicesForProgramDocument = gql`
    query ServicesForProgram($lang: String!, $id: String!) {
  root(lang: $lang) {
    program(id: $id) {
      id
      services {
        ...StandardServiceFragment
      }
    }
  }
}
    ${StandardServiceFragmentFragmentDoc}`;

/**
 * __useServicesForProgramQuery__
 *
 * To run a query within a React component, call `useServicesForProgramQuery` and pass it any options that fit your needs.
 * When your component renders, `useServicesForProgramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServicesForProgramQuery({
 *   variables: {
 *      lang: // value for 'lang'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useServicesForProgramQuery(baseOptions: Apollo.QueryHookOptions<ServicesForProgramQuery, ServicesForProgramQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ServicesForProgramQuery, ServicesForProgramQueryVariables>(ServicesForProgramDocument, options);
      }
export function useServicesForProgramLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ServicesForProgramQuery, ServicesForProgramQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ServicesForProgramQuery, ServicesForProgramQueryVariables>(ServicesForProgramDocument, options);
        }
export type ServicesForProgramQueryHookResult = ReturnType<typeof useServicesForProgramQuery>;
export type ServicesForProgramLazyQueryHookResult = ReturnType<typeof useServicesForProgramLazyQuery>;
export type ServicesForProgramQueryResult = Apollo.QueryResult<ServicesForProgramQuery, ServicesForProgramQueryVariables>;