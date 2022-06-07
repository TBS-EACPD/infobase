import { gql } from "@apollo/client";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { query_factory } from "src/graphql_utils/graphql_utils";

const all_service_fragments = `
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
  `;

const all_service_summary_fragments = `
  service_summary{
    service_general_stats{
      report_years
      number_of_services
      number_of_online_enabled_services
      pct_of_standards_met_high_vol_services
      pct_of_online_client_interaction_pts
      num_of_subject_offering_services
      num_of_programs_offering_services
    }
    service_channels_summary{\
      subject_id
      year
      channel_id
      channel_value
    }
    service_digital_status_summary{
      key
      key_desc
      subject_id
      can_online
      cannot_online
      not_applicable
    }
    service_standards_summary{
      subject_id
      services_w_standards_count
      standards_count
      met_standards_count
    }
    subject_offering_services_summary{
      subject_id
      number_of_services
      total_volume
    }
  }
`;

export const {
  promisedDeptHasServices,
  suspendedDeptHasServices,
  useDeptHasServices,
} = query_factory()({
  query_name: "DeptHasServices",
  query: gql`
    query($lang: String! = "${lang}", $id: String!) {
      root(lang: $lang) {
        org(org_id: $id){
          id
          has_services
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.org"),
});
export const {
  promisedProgramHasServices,
  suspendedProgramHasServices,
  useProgramHasServices,
} = query_factory()({
  query_name: "ProgramHasServices",
  query: gql`
    query($lang: String! = "${lang}", $id: String!) {
      root(lang: $lang) {
        program(id: $id) {
          id
          has_services
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.program"),
});

export const {
  promisedSearchServices,
  suspendedSearchServices,
  useSearchServices,
} = query_factory()({
  query_name: "SearchServices",
  query: gql`
    query($lang: String! = "${lang}", $search_phrase: String!) {
      root(lang: $lang) {
        search_services(search_phrase: $search_phrase) {
          id
          subject_type
          org_id
          name
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.search_services"),
});

export const {
  promisedSingleService,
  suspendedSingleService,
  useSingleService,
} = query_factory()({
  query_name: "SingleService",
  query: gql`
    query($lang: String! = "${lang}", $service_id: String!) {
      root(lang: $lang) {
        service(id: $service_id){
          ${all_service_fragments}
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.service"),
});

export const {
  promisedServicesByGov,
  suspendedServicesByGov,
  useServicesByGov,
} = query_factory()({
  query_name: "ServicesByGov",
  query: gql`
  query($lang: String! = "${lang}") {
    root(lang: $lang) {
      orgs {
        services {
          ${all_service_fragments}
        }
      }
    }
  }
  `,
  resolver: (response) => _.get(response, "root.orgs.services"),
});

export const {
  promisedServiceSummaryGov,
  suspendedServiceSummaryGov,
  useServiceSummaryGov,
} = query_factory()({
  query_name: "ServiceSummaryGov",
  query: gql`
    query($lang: String! = "${lang}") {
      root(lang: $lang) {
        gov{
          id
          ${all_service_summary_fragments}
        }
      }
    }
    `,
  resolver: (response) => _.get(response, "root.gov.service_summary"),
});
export const {
  promisedServiceSummaryOrg,
  suspendedServiceSummaryOrg,
  useServiceSummaryOrg,
} = query_factory()({
  query_name: "ServiceSummaryOrg",
  query: gql`
    query($lang: String! = "${lang}", $id: String) {
      root(lang: $lang) {
        org(org_id: $id){
          id
          ${all_service_summary_fragments}
        }
      }
    }
    `,
  resolver: (response) => _.get(response, "root.org.service_summary"),
});
export const {
  promisedServiceSummaryProgram,
  suspendedServiceSummaryProgram,
  useServiceSummaryProgram,
} = query_factory()({
  query_name: "ServiceSummaryProgram",
  query: gql`
    query($lang: String! = "${lang}", $id: String) {
      root(lang: $lang) {
        program(id: $id){
          id
          ${all_service_summary_fragments}
        }
      }
    }
    `,
  resolver: (response) => _.get(response, "root.program.service_summary"),
});
