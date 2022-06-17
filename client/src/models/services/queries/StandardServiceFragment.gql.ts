import * as Types from '../../../types/types.gql';

import { gql } from '@apollo/client';
export type StandardServiceFragmentFragment = { __typename?: 'Service', id?: string | null, subject_type?: string | null, org_id?: string | null, submission_year?: string | null, is_active?: boolean | null, report_years?: Array<string | null> | null, program_activity_codes?: Array<string | null> | null, first_active_year?: string | null, last_active_year?: string | null, name?: string | null, description?: string | null, service_type?: Array<string | null> | null, scope?: Array<string | null> | null, designations?: Array<string | null> | null, target_groups?: Array<string | null> | null, feedback_channels?: Array<string | null> | null, urls?: Array<string | null> | null, digital_identity_platforms?: Array<string | null> | null, accessibility_assessors?: Array<string | null> | null, recipient_type?: Array<string | null> | null, last_gender_analysis?: string | null, last_accessibility_review?: string | null, last_improve_from_feedback?: string | null, collects_fees?: boolean | null, account_reg_digital_status?: boolean | null, authentication_status?: boolean | null, application_digital_status?: boolean | null, decision_digital_status?: boolean | null, issuance_digital_status?: boolean | null, issue_res_digital_status?: boolean | null, digital_enablement_comment?: string | null, service_report?: Array<{ __typename?: 'ServiceReport', service_id?: string | null, year?: string | null, cra_business_ids_collected?: boolean | null, sin_collected?: boolean | null, phone_inquiry_count?: number | null, online_inquiry_count?: number | null, online_application_count?: number | null, live_application_count?: number | null, mail_application_count?: number | null, phone_application_count?: number | null, other_application_count?: number | null, email_application_count?: number | null, fax_application_count?: number | null, phone_inquiry_and_application_count?: number | null, service_report_comment?: string | null } | null> | null, standards?: Array<{ __typename?: 'ServiceStandard', standard_id?: string | null, service_id?: string | null, name?: string | null, submission_year?: string | null, first_active_year?: string | null, last_active_year?: string | null, last_gcss_tool_year?: string | null, channel?: string | null, type?: string | null, other_type_comment?: string | null, target_type?: string | null, standard_urls?: Array<string | null> | null, rtp_urls?: Array<string | null> | null, standard_report?: Array<{ __typename?: 'StandardReport', standard_id?: string | null, year?: string | null, lower?: number | null, upper?: number | null, count?: number | null, met_count?: number | null, is_target_met?: boolean | null, standard_report_comment?: string | null } | null> | null } | null> | null };

export const StandardServiceFragmentFragmentDoc = gql`
    fragment StandardServiceFragment on Service {
  id
  subject_type
  org_id
  submission_year
  is_active
  report_years
  program_activity_codes
  first_active_year
  last_active_year
  name
  description
  service_type
  scope
  designations
  target_groups
  feedback_channels
  urls
  digital_identity_platforms
  accessibility_assessors
  recipient_type
  last_gender_analysis
  last_accessibility_review
  last_improve_from_feedback
  collects_fees
  account_reg_digital_status
  authentication_status
  application_digital_status
  decision_digital_status
  issuance_digital_status
  issue_res_digital_status
  digital_enablement_comment
  service_report {
    service_id
    year
    cra_business_ids_collected
    sin_collected
    phone_inquiry_count
    online_inquiry_count
    online_application_count
    live_application_count
    mail_application_count
    phone_application_count
    other_application_count
    email_application_count
    fax_application_count
    phone_inquiry_and_application_count
    service_report_comment
  }
  standards {
    standard_id
    service_id
    name
    submission_year
    first_active_year
    last_active_year
    last_gcss_tool_year
    channel
    type
    other_type_comment
    target_type
    standard_urls
    rtp_urls
    standard_report {
      standard_id
      year
      lower
      upper
      count
      met_count
      is_target_met
      standard_report_comment
    }
  }
}
    `;