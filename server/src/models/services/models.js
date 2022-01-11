import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_id_attr_dataloader,
  create_resource_by_foreignkey_attr_dataloader,
} from "../loader_utils.js";
import {
  pkey_type,
  parent_fkey_type,
  sparse_parent_fkey_type,
  str_type,
  bilingual_str,
  bilingual,
} from "../model_utils.js";
import { make_schema_with_search_terms } from "../search_utils.js";

export default function (model_singleton) {
  const ServiceSchema = make_schema_with_search_terms(
    {
      id: pkey_type(),
      org_id: parent_fkey_type(),
      program_activity_codes: [sparse_parent_fkey_type()],
      submission_year: { type: Number },
      is_active: { type: Boolean },
      report_years: [{ type: Number }],
      first_active_year: { type: Number },
      last_active_year: { type: Number },

      ...bilingual_str("name"),
      ...bilingual_str("description"),
      ...bilingual("service_type", [str_type]),
      ...bilingual("scope", [str_type]),
      ...bilingual("designations", [str_type]),
      ...bilingual("target_groups", [str_type]),
      ...bilingual("feedback_channels", [str_type]),
      ...bilingual("urls", [str_type]),
      ...bilingual("digital_identity_platforms", [str_type]),
      ...bilingual("accessibility_assessors", [str_type]),
      ...bilingual("recipient_type", [str_type]),

      last_gender_analysis: { type: Number },
      last_accessibility_review: { type: Number },
      last_improve_from_feedback: { type: Number },

      collects_fees: { type: Boolean },
      account_reg_digital_status: { type: Boolean },
      authentication_status: { type: Boolean },
      application_digital_status: { type: Boolean },
      decision_digital_status: { type: Boolean },
      issuance_digital_status: { type: Boolean },
      issue_res_digital_status: { type: Boolean },
      ...bilingual_str("digital_enablement_comment"),
      standards: [
        {
          submission_year: { type: Number },
          standard_id: parent_fkey_type(),
          service_id: parent_fkey_type(),
          first_active_year: { type: Number },
          last_active_year: { type: Number },

          ...bilingual_str("name"),

          last_gcss_tool_year: { type: Number },
          target_type: str_type,
          ...bilingual_str("channel"),
          ...bilingual_str("type"),
          ...bilingual_str("other_type_comment"),

          ...bilingual("standard_urls", [str_type]),
          ...bilingual("rtp_urls", [str_type]),
          standard_report: [
            {
              standard_id: parent_fkey_type(),
              year: { type: Number },
              lower: { type: Number },
              upper: { type: Number },
              count: { type: Number },
              met_count: { type: Number },
              is_target_met: { type: Boolean },
              ...bilingual_str("standard_report_comment"),
            },
          ],
        },
      ],
      service_report: [
        {
          service_id: parent_fkey_type(),
          year: { type: Number },
          cra_business_ids_collected: { type: Boolean },
          sin_collected: { type: Boolean },
          phone_inquiry_count: { type: Number },
          online_inquiry_count: { type: Number },
          online_application_count: { type: Number },
          live_application_count: { type: Number },
          mail_application_count: { type: Number },
          phone_application_count: { type: Number },
          other_application_count: { type: Number },
          email_application_count: { type: Number },
          fax_application_count: { type: Number },
          phone_inquiry_and_application_count: { type: Number },
          ...bilingual_str("service_report_comment"),
        },
      ],
    },
    ..._.keys(bilingual_str("name"))
  );

  const common_service_fields = {
    id: pkey_type(),
    service_general_stats: {
      report_years: [{ type: Number }],
      standard_years: [{ type: Number }],
      number_of_services: { type: Number },
      number_of_online_enabled_services: { type: Number },
      pct_of_online_client_interaction_pts: { type: Number },
      pct_of_standards_met_high_vol_services: { type: Number },
      num_of_subject_offering_services: { type: Number }, // only for gov
      num_of_programs_offering_services: { type: Number }, // only for gov, org
    },
    service_channels_summary: [
      {
        subject_id: parent_fkey_type(),
        year: { type: Number },
        channel_id: str_type,
        channel_value: { type: Number },
      },
    ],
    service_digital_status_summary: [
      {
        key_desc: str_type,
        key: str_type,
        subject_id: parent_fkey_type(),
        can_online: { type: Number },
        cannot_online: { type: Number },
        not_applicable: { type: Number },
      },
    ],
    service_standards_summary: [
      {
        subject_id: parent_fkey_type(),
        year: { type: Number },
        services_w_standards_count: { type: Number },
        standards_count: { type: Number },
        met_standards_count: { type: Number },
      },
    ],
  };
  const subject_offering_services_summary_fields = {
    subject_id: parent_fkey_type(),
    number_of_services: { type: Number },
    total_volume: { type: Number },
  };

  const GovServiceSummarySchema = mongoose.Schema({
    ...common_service_fields,
    subject_offering_services_summary: [
      subject_offering_services_summary_fields,
    ],
  });
  const OrgServiceSummarySchema = mongoose.Schema({
    ...common_service_fields,
    subject_offering_services_summary: [
      subject_offering_services_summary_fields,
    ],
  });
  const ProgramServiceSummarySchema = mongoose.Schema({
    ...common_service_fields,
  });

  model_singleton.define_model("Service", ServiceSchema);
  model_singleton.define_model("GovServiceSummary", GovServiceSummarySchema);
  model_singleton.define_model("OrgServiceSummary", OrgServiceSummarySchema);
  model_singleton.define_model(
    "ProgramServiceSummary",
    ProgramServiceSummarySchema
  );

  const {
    Service,
    GovServiceSummary,
    OrgServiceSummary,
    ProgramServiceSummary,
  } = model_singleton.models;

  const loaders = {
    service_loader: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "id"
    ),
    services_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "org_id"
    ),
    services_by_program_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "program_activity_codes"
    ),
    gov_service_summary_loader: create_resource_by_id_attr_dataloader(
      GovServiceSummary,
      "id"
    ),
    org_service_summary_loader: create_resource_by_id_attr_dataloader(
      OrgServiceSummary,
      "id"
    ),
    program_service_summary_loader: create_resource_by_id_attr_dataloader(
      ProgramServiceSummary,
      "id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
