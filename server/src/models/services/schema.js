import _ from "lodash";

import { bilingual_field } from "../schema_utils.js";
import { get_search_terms_resolver } from "../search_utils.js";

const schema = `
  extend type Root{
    service(id: String!): Service
    search_services(search_phrase: String!): [Service]
  }
  extend type Gov{
    service_summary: ServiceSummary
  }
  extend type Org{
    service_summary: ServiceSummary
    services: [Service]
    has_services: Boolean
  }
  extend type Program{
    service_summary: ServiceSummary
    services: [Service]
    has_services: Boolean
  }

  type ServiceSummary{
    id: String
    service_general_stats: ServiceGeneralStats
    service_channels_summary: [ServiceChannelsSummary]
    service_digital_status_summary: [ServiceDigitalStatusSummary]
    service_standards_summary: [ServiceStandardsSummary]
    subject_offering_services_summary: [OrgsOfferingServicesSummary]
  }
  type ServiceGeneralStats{
    report_years: [String]
    standard_years: [String]
    number_of_services: Float
    number_of_online_enabled_services: Float
    pct_of_standards_met_high_vol_services: Float
    pct_of_online_client_interaction_pts: Float
    num_of_subject_offering_services: Float
    num_of_programs_offering_services: Float
  }
  type ServiceChannelsSummary{
    subject_id: String
    year: String
    channel_id: String
    channel_value: Float
  }
  type ServiceDigitalStatusSummary{
    key: String
    key_desc: String
    subject_id: String
    can_online: Float
    cannot_online: Float
    not_applicable: Float
  }
  type ServiceStandardsSummary{
    subject_id: String
    year: String
    services_w_standards_count: Float
    standards_count: Float
    met_standards_count: Float
  }
  type OrgsOfferingServicesSummary{
    subject_id: String
    number_of_services: Float
    total_volume: Float
  }
  type ServiceReport{
    service_id: String
    year: String
    cra_business_ids_collected: Boolean
    sin_collected: Boolean
    phone_inquiry_count: Float
    online_inquiry_count: Float
    online_application_count: Float
    live_application_count: Float
    mail_application_count: Float
    phone_application_count: Float
    other_application_count: Float
    email_application_count: Float
    fax_application_count: Float
    phone_inquiry_and_application_count: Float
    service_report_comment: String
  }

  type StandardReport{
    standard_id: String
    year: String
    lower: Float
    upper: Float
    count: Float
    met_count: Float
    is_target_met: Boolean
    standard_report_comment: String
  }

  type Service{
    id: String
    subject_type: String
    org_id: String
    org: Org
    submission_year: String
    is_active: Boolean
    report_years: [String]
    program_activity_codes: [String]
    programs: [Program]
    first_active_year: String
    last_active_year: String

    name: String
    description: String
    service_type: [String]
    scope: [String]
    designations: [String]
    target_groups: [String]
    feedback_channels: [String]
    urls: [String]
    digital_identity_platforms: [String]
    accessibility_assessors: [String]
    recipient_type: [String]

    last_gender_analysis: String
    last_accessibility_review: String
    last_improve_from_feedback: String

    collects_fees: Boolean
    account_reg_digital_status: Boolean
    authentication_status: Boolean
    application_digital_status: Boolean
    decision_digital_status: Boolean
    issuance_digital_status: Boolean
    issue_res_digital_status: Boolean
    digital_enablement_comment: String

    standards: [ServiceStandard]
    service_report: [ServiceReport]
  }

  type ServiceStandard{
    standard_id: String
    service_id: String
    name: String

    submission_year: String
    first_active_year: String
    last_active_year: String
    last_gcss_tool_year: String
    channel: String
    type: String
    other_type_comment: String

    target_type: String
    standard_urls: [String]
    rtp_urls: [String]
    standard_report: [StandardReport]
  }
`;

export default function ({ models, loaders }) {
  const { Service } = models;

  const {
    service_loader,
    services_by_org_id,
    services_by_program_id,
    org_id_loader,
    prog_id_loader,
    gov_service_summary_loader,
    org_service_summary_loader,
    program_service_summary_loader,
  } = loaders;

  const org_has_services = async (org_id) => {
    const has_service = await Service.findOne({ org_id: org_id });
    return !_.isNull(has_service);
  };
  const program_has_services = async (program_id) => {
    const has_service = await Service.findOne({
      program_activity_codes: program_id,
    });
    return !_.isNull(has_service);
  };

  const resolvers = {
    Root: {
      service: (_x, { id }) => service_loader.load(id).then(_.head),
      search_services: get_search_terms_resolver(Service),
    },
    Gov: {
      service_summary: () => gov_service_summary_loader.load("gov"),
    },
    Org: {
      services: ({ org_id }) => services_by_org_id.load(org_id),
      service_summary: ({ org_id }) => org_service_summary_loader.load(org_id),
      has_services: ({ org_id }) => org_has_services(org_id),
    },
    Program: {
      services: ({ program_id }) => services_by_program_id.load(program_id),
      service_summary: ({ program_id }) =>
        program_service_summary_loader.load(program_id),
      has_services: ({ program_id }) => program_has_services(program_id),
    },
    Service: {
      subject_type: () => "service",
      org: ({ org_id }) => org_id_loader.load(org_id),
      programs: ({ program_activity_codes }) =>
        _.map(program_activity_codes, (program_id) =>
          prog_id_loader.load(program_id)
        ),
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      service_type: bilingual_field("service_type"),
      scope: bilingual_field("scope"),
      designations: bilingual_field("designations"),
      target_groups: bilingual_field("target_groups"),
      feedback_channels: bilingual_field("feedback_channels"),
      urls: bilingual_field("urls"),
      digital_enablement_comment: bilingual_field("digital_enablement_comment"),
      digital_identity_platforms: bilingual_field("digital_identity_platforms"),
      accessibility_assessors: bilingual_field("accessibility_assessors"),
      recipient_type: bilingual_field("recipient_type"),
    },
    ServiceStandard: {
      name: bilingual_field("name"),
      other_type_comment: bilingual_field("other_type_comment"),
      //target_comment: bilingual_field("comment"),
      channel: bilingual_field("channel"),
      type: bilingual_field("type"),
      standard_urls: bilingual_field("standard_urls"),
      rtp_urls: bilingual_field("rtp_urls"),
    },
    ServiceReport: {
      service_report_comment: bilingual_field("service_report_comment"),
    },
    StandardReport: {
      standard_report_comment: bilingual_field("standard_report_comment"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
