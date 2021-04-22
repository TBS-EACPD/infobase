import _ from "lodash";

import { bilingual_field } from "../schema_utils.js";

const schema = `
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
    service_type_summary: [ServiceTypeSummary]
    service_digital_status_summary: [ServiceDigitalStatusSummary]
  }
  type ServiceGeneralStats{
    id: String
    number_of_services: Float
  }
  type ServiceTypeSummary{
    id: String
    subject_id: String
    label: String
    value: Float
  }
  type ServiceDigitalStatusSummary{
    id: String
    key: String
    key_desc: String
    subject_id: String
    can_online: Float
    cannot_online: Float
    not_applicable: Float
  }
  type ServiceReport{
    service_id: String
    year: String,
    cra_business_ids_collected: Boolean,
    sin_collected: Boolean,
    phone_inquiry_count: Float,
    online_inquiry_count: Float,
    online_application_count: Float,
    live_application_count: Float,
    mail_application_count: Float,
    other_application_count: Float,
    service_report_comment: String
  }
  type StandardReport{
    standard_id: String,
    year: String,
    lower: Float,
    count: Float,
    met_count: Float,
    is_target_met: Boolean,
    standard_report_comment: String
  }
  type Service{
    id: String
    org_id: String
    org: Org
    program_ids: [String]
    programs: [Program]
    first_active_year: String
    last_active_year: String
    is_active: Boolean

    name: String
    description: String
    service_type: [String]
    scope: [String]
    target_groups: [String]
    feedback_channels: [String]
    urls: [String]

    last_gender_analysis: String

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

    last_gcss_tool_year: String
    channel: String
    type: String
    other_type_comment: String

    target_type: String
    urls: [String]
    rtp_urls: [String]
    standard_report: [StandardReport]
  }
`;

export default function ({ models, loaders }) {
  const { Service } = models;

  const {
    services_by_org_id,
    services_by_program_id,
    org_id_loader,
    prog_id_loader,
    service_general_stats_for_gov,
    service_general_stats_for_dept,
    service_general_stats_for_program,
    service_types_summary_for_gov,
    service_types_summary_for_dept,
    service_types_summary_for_program,
    service_digital_status_summary_for_gov,
    service_digital_status_summary_for_dept,
    service_digital_status_summary_for_program,
  } = loaders;

  const org_has_services = async (org_id) => {
    const has_service = await Service.findOne({ org_id: org_id });
    return !_.isNull(has_service);
  };
  const program_has_services = async (program_id) => {
    const has_service = await Service.findOne({ program_ids: program_id });
    return !_.isNull(has_service);
  };

  const resolvers = {
    Gov: {
      service_summary: () => ({
        service_general_stats: service_general_stats_for_gov.load("gov"),
        service_type_summary: service_types_summary_for_gov.load("gov"),
        service_digital_status_summary: service_digital_status_summary_for_gov.load(
          "gov"
        ),
      }),
    },
    Org: {
      services: ({ org_id }) => services_by_org_id.load(org_id),
      service_summary: ({ org_id }) => ({
        service_general_stats: service_general_stats_for_dept.load(org_id),
        service_type_summary: service_types_summary_for_dept.load(org_id),
        service_digital_status_summary: service_digital_status_summary_for_dept.load(
          org_id
        ),
      }),
      has_services: ({ org_id }) => org_has_services(org_id),
    },
    Program: {
      services: ({ program_id }) => services_by_program_id.load(program_id),
      service_summary: ({ program_id }) => ({
        service_general_stats: service_general_stats_for_program.load(
          program_id
        ),
        service_type_summary: service_types_summary_for_program.load(
          program_id
        ),
        service_digital_status_summary: service_digital_status_summary_for_program.load(
          program_id
        ),
      }),
      has_services: ({ program_id }) => program_has_services(program_id),
    },
    ServiceTypeSummary: {
      label: bilingual_field("label"),
    },
    Service: {
      org: ({ org_id }) => org_id_loader.load(org_id),
      programs: ({ program_ids }) =>
        _.map(program_ids, (program_id) => prog_id_loader.load(program_id)),
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      service_type: bilingual_field("service_type"),
      scope: bilingual_field("scope"),
      target_groups: bilingual_field("target_groups"),
      feedback_channels: bilingual_field("feedback_channels"),
      urls: bilingual_field("urls"),
      //comment: bilingual_field("comment"),
      digital_enablement_comment: bilingual_field("digital_enablement_comment"),
    },
    ServiceStandard: {
      name: bilingual_field("name"),
      other_type_comment: bilingual_field("other_type_comment"),
      //target_comment: bilingual_field("comment"),
      channel: bilingual_field("channel"),
      type: bilingual_field("type"),
      urls: bilingual_field("urls"),
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
