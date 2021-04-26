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
  sparse_pkey_type,
  str_type,
  bilingual_str,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const ServiceReportSchema = mongoose.Schema({
    service_id: parent_fkey_type(),
    year: str_type,
    cra_business_ids_collected: { type: Boolean },
    sin_collected: { type: Boolean },
    phone_inquiry_count: { type: Number },
    online_inquiry_count: { type: Number },
    online_application_count: { type: Number },
    live_application_count: { type: Number },
    mail_application_count: { type: Number },
    other_application_count: { type: Number },
    ...bilingual_str("service_report_comment"),
  });

  const StandardReportSchema = mongoose.Schema({
    standard_id: parent_fkey_type(),
    year: str_type,
    lower: { type: Number },
    count: { type: Number },
    met_count: { type: Number },
    is_target_met: { type: Boolean },
    ...bilingual_str("standard_report_comment"),
  });

  const ServiceStandardSchema = mongoose.Schema({
    standard_id: sparse_pkey_type(),
    service_id: parent_fkey_type(),
    //is_active: { type: Boolean },

    ...bilingual_str("name"),

    last_gcss_tool_year: str_type,
    target_type: str_type,
    ...bilingual_str("channel"),
    ...bilingual_str("type"),
    ...bilingual_str("other_type_comment"),

    //is_target_met: { type: Boolean },
    ...bilingual("standard_urls_en", [str_type]),
    ...bilingual("rtp_urls", [str_type]),
    standard_report: [StandardReportSchema],
  });

  const ServiceSchema = mongoose.Schema({
    id: pkey_type(),
    org_id: parent_fkey_type(),
    program_ids: [sparse_parent_fkey_type()],
    first_active_year: str_type,
    last_active_year: str_type,
    is_active: { type: Boolean },

    ...bilingual_str("name"),
    ...bilingual_str("description"),
    ...bilingual("service_type", [str_type]),
    ...bilingual("scope", [str_type]),
    ...bilingual("designations", [str_type]),
    ...bilingual("target_groups", [str_type]),
    ...bilingual("feedback_channels", [str_type]),
    ...bilingual("urls", [str_type]),

    last_gender_analysis: str_type,

    collects_fees: { type: Boolean },
    account_reg_digital_status: { type: Boolean },
    authentication_status: { type: Boolean },
    application_digital_status: { type: Boolean },
    decision_digital_status: { type: Boolean },
    issuance_digital_status: { type: Boolean },
    issue_res_digital_status: { type: Boolean },
    ...bilingual_str("digital_enablement_comment"),
    standards: [ServiceStandardSchema],
    service_report: [ServiceReportSchema],
  });

  const ServiceGeneralStatsSchema = mongoose.Schema({
    id: pkey_type(),
    number_of_services: { type: Number },
  });
  const ServiceTypeSummarySchema = mongoose.Schema({
    id: pkey_type(),
    subject_id: parent_fkey_type(),
    ...bilingual_str("label"),
    value: { type: Number },
  });
  const ServiceDigitalStatusSummarySchema = mongoose.Schema({
    id: pkey_type(),
    key_desc: str_type,
    key: str_type,
    subject_id: parent_fkey_type(),
    can_online: { type: Number },
    cannot_online: { type: Number },
    not_applicable: { type: Number },
  });
  const ServiceIdMethodsSummarySchema = mongoose.Schema({
    id: pkey_type(),
    subject_id: parent_fkey_type(),
    method: str_type,
    label: str_type,
    value: { type: Number },
  });
  const ServiceStandardsSummarySchema = mongoose.Schema({
    id: pkey_type(),
    subject_id: parent_fkey_type(),
    services_w_standards_count: { type: Number },
    standards_count: { type: Number },
    met_standards_count: { type: Number },
  });
  const ServiceFeesSummarySchema = mongoose.Schema({
    id: pkey_type(),
    subject_id: parent_fkey_type(),
    label: str_type,
    value: { type: Number },
  });
  const TopServicesApplicationVolSummarySchema = mongoose.Schema({
    id: pkey_type(),
    service_id: parent_fkey_type(),
    subject_id: parent_fkey_type(),
    ...bilingual_str("name"),
    value: { type: Number },
  });

  model_singleton.define_model("ServiceReport", ServiceReportSchema);
  model_singleton.define_model("StandardReport", StandardReportSchema);
  model_singleton.define_model("ServiceStandard", ServiceStandardSchema);
  model_singleton.define_model("Service", ServiceSchema);

  const define_models_w_same_schema = (names, schema) => {
    _.forEach(names, (name) => {
      model_singleton.define_model(name, schema);
    });
  };
  define_models_w_same_schema(
    [
      "GovServiceGeneralStats",
      "DeptServiceGeneralStats",
      "ProgramServiceGeneralStats",
    ],
    ServiceGeneralStatsSchema
  );

  define_models_w_same_schema(
    [
      "GovServiceTypeSummary",
      "DeptServiceTypeSummary",
      "ProgramServiceTypeSummary",
    ],
    ServiceTypeSummarySchema
  );
  define_models_w_same_schema(
    [
      "GovServiceDigitalStatusSummary",
      "DeptServiceDigitalStatusSummary",
      "ProgramServiceDigitalStatusSummary",
    ],
    ServiceDigitalStatusSummarySchema
  );
  define_models_w_same_schema(
    [
      "GovServiceIdMethodsSummary",
      "DeptServiceIdMethodsSummary",
      "ProgramServiceIdMethodsSummary",
    ],
    ServiceIdMethodsSummarySchema
  );
  define_models_w_same_schema(
    [
      "GovServiceStandardsSummary",
      "DeptServiceStandardsSummary",
      "ProgramServiceStandardsSummary",
    ],
    ServiceStandardsSummarySchema
  );
  define_models_w_same_schema(
    [
      "GovServiceFeesSummary",
      "DeptServiceFeesSummary",
      "ProgramServiceFeesSummary",
    ],
    ServiceFeesSummarySchema
  );
  define_models_w_same_schema(
    [
      "DeptTopServicesApplicationVolSummary",
      "ProgramTopServicesApplicationVolSummary",
    ],
    TopServicesApplicationVolSummarySchema
  );

  const {
    Service,
    GovServiceGeneralStats,
    DeptServiceGeneralStats,
    ProgramServiceGeneralStats,
    GovServiceTypeSummary,
    DeptServiceTypeSummary,
    ProgramServiceTypeSummary,
    GovServiceDigitalStatusSummary,
    DeptServiceDigitalStatusSummary,
    ProgramServiceDigitalStatusSummary,
    GovServiceIdMethodsSummary,
    DeptServiceIdMethodsSummary,
    ProgramServiceIdMethodsSummary,
    GovServiceStandardsSummary,
    DeptServiceStandardsSummary,
    ProgramServiceStandardsSummary,
    GovServiceFeesSummary,
    DeptServiceFeesSummary,
    ProgramServiceFeesSummary,
    DeptTopServicesApplicationVolSummary,
    ProgramTopServicesApplicationVolSummary,
  } = model_singleton.models;

  const define_loaders_w_same_fk_attr = (schemas_and_names, fk_attr) =>
    _.chain(schemas_and_names)
      .map(({ schema, name }) => [
        name,
        create_resource_by_foreignkey_attr_dataloader(schema, fk_attr),
      ])
      .fromPairs()
      .value();

  const loaders = {
    services_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "org_id"
    ),
    services_by_program_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "program_ids"
    ),
    service_general_stats_for_gov: create_resource_by_id_attr_dataloader(
      GovServiceGeneralStats,
      "id"
    ),
    service_general_stats_for_dept: create_resource_by_id_attr_dataloader(
      DeptServiceGeneralStats,
      "id"
    ),
    service_general_stats_for_program: create_resource_by_id_attr_dataloader(
      ProgramServiceGeneralStats,
      "id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: GovServiceTypeSummary,
          name: "service_types_summary_for_gov",
        },
        {
          schema: DeptServiceTypeSummary,
          name: "service_types_summary_for_dept",
        },
        {
          schema: ProgramServiceTypeSummary,
          name: "service_types_summary_for_program",
        },
      ],
      "subject_id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: GovServiceDigitalStatusSummary,
          name: "service_digital_status_summary_for_gov",
        },
        {
          schema: DeptServiceDigitalStatusSummary,
          name: "service_digital_status_summary_for_dept",
        },
        {
          schema: ProgramServiceDigitalStatusSummary,
          name: "service_digital_status_summary_for_program",
        },
      ],
      "subject_id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: GovServiceIdMethodsSummary,
          name: "service_id_methods_summary_for_gov",
        },
        {
          schema: DeptServiceIdMethodsSummary,
          name: "service_id_methods_summary_for_dept",
        },
        {
          schema: ProgramServiceIdMethodsSummary,
          name: "service_id_methods_summary_for_program",
        },
      ],
      "subject_id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: GovServiceStandardsSummary,
          name: "service_standards_summary_for_gov",
        },
        {
          schema: DeptServiceStandardsSummary,
          name: "service_standards_summary_for_dept",
        },
        {
          schema: ProgramServiceStandardsSummary,
          name: "service_standards_summary_for_program",
        },
      ],
      "subject_id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: GovServiceFeesSummary,
          name: "service_fees_summary_for_gov",
        },
        {
          schema: DeptServiceFeesSummary,
          name: "service_fees_summary_for_dept",
        },
        {
          schema: ProgramServiceFeesSummary,
          name: "service_fees_summary_for_program",
        },
      ],
      "subject_id"
    ),
    ...define_loaders_w_same_fk_attr(
      [
        {
          schema: DeptTopServicesApplicationVolSummary,
          name: "top_services_application_vol_summary_for_dept",
        },
        {
          schema: ProgramTopServicesApplicationVolSummary,
          name: "top_services_application_vol_summary_for_program",
        },
      ],
      "subject_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
