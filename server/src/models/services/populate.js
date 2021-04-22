import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { digital_status_keys } from "./constants.js";

const multi_value_string_fields_to_arrays = (list_fields, seperator = "<>") =>
  _.mapValues(list_fields, (array_string) => _.split(array_string, seperator));
const convert_to_bool_or_null = (value, true_val, false_val) => {
  if (value === true_val) {
    return true;
  } else if (value === false_val) {
    return false;
  } else {
    return null;
  }
};
export default async function ({ models }) {
  const {
    ServiceStandard,
    Service,
    ServiceReport,
    StandardReport,
    GovServiceTypeSummary,
    DeptServiceTypeSummary,
    ProgramServiceTypeSummary,
    GovServiceDigitalStatusSummary,
    DeptServiceDigitalStatusSummary,
    ProgramServiceDigitalStatusSummary,
  } = models;

  const service_report_rows = _.map(
    get_standard_csv_file_rows("service-report.csv"),
    ({
      id: standard_id,
      cra_business_ids_collected,
      sin_collected,
      comment: service_report_comment,

      ...other_fields
    }) => ({
      standard_id,
      cra_business_ids_collected: convert_to_bool_or_null(
        cra_business_ids_collected,
        "Yes",
        "No"
      ),
      sin_collected: convert_to_bool_or_null(sin_collected, "Yes", "No"),
      service_report_comment,
      ...other_fields,
    })
  );
  const standard_report_rows = _.map(
    get_standard_csv_file_rows("standard-report.csv"),
    ({ is_target_met, comment: standard_report_comment, ...other_fields }) => ({
      is_target_met: convert_to_bool_or_null(_.toInteger(is_target_met), 1, 0),
      standard_report_comment,
      ...other_fields,
    })
  );

  const service_standard_rows = _.map(
    get_standard_csv_file_rows("standards.csv"),
    ({
      id: standard_id,

      standard_urls_en,
      standard_urls_fr,
      rtp_urls_en,
      rtp_urls_fr,

      ...other_fields
    }) => ({
      standard_id,
      ...multi_value_string_fields_to_arrays({
        standard_urls_en,
        standard_urls_fr,
        rtp_urls_en,
        rtp_urls_fr,
      }),
      ...other_fields,
      standard_report: _.filter(
        standard_report_rows,
        (standard_report) => standard_report.standard_id === standard_id
      ),
    })
  );

  const service_rows = _.map(
    get_standard_csv_file_rows("services.csv"),
    ({
      id,
      dept_code,
      collects_fees,
      is_active,
      account_reg_digital_status,
      authentication_status,
      application_digital_status,
      decision_digital_status,
      issuance_digital_status,
      issue_res_digital_status,

      service_type_en,
      service_type_fr,
      service_type_code,
      scope_en,
      scope_fr,
      designations_en,
      designations_fr,
      target_groups_en,
      target_groups_fr,
      program_ids,
      feedback_channels_en,
      feedback_channels_fr,
      urls_en,
      urls_fr,

      ...other_fields
    }) => ({
      id,
      is_active: convert_to_bool_or_null(_.toInteger(is_active), 1, 0),
      collects_fees: convert_to_bool_or_null(collects_fees, "Yes", "No"),
      account_reg_digital_status: convert_to_bool_or_null(
        account_reg_digital_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      authentication_status: convert_to_bool_or_null(
        authentication_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      application_digital_status: convert_to_bool_or_null(
        application_digital_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      decision_digital_status: convert_to_bool_or_null(
        decision_digital_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      issuance_digital_status: convert_to_bool_or_null(
        issuance_digital_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      issue_res_digital_status: convert_to_bool_or_null(
        issue_res_digital_status,
        "ENABLED",
        "NOT_ENABLED"
      ),
      program_ids: _.chain(program_ids)
        .split("<>")
        .map((id) => `${dept_code}-${id}`)
        .value(),
      ...multi_value_string_fields_to_arrays({
        service_type_en,
        service_type_fr,
        service_type_code,
        scope_en,
        scope_fr,
        designations_en,
        designations_fr,
        target_groups_en,
        target_groups_fr,
        feedback_channels_en,
        feedback_channels_fr,
        urls_en,
        urls_fr,
      }),
      ...other_fields,

      standards: _.filter(
        service_standard_rows,
        (service_standard) => service_standard.service_id === id
      ),
      service_report: _.filter(
        service_report_rows,
        (service_report) => service_report.service_id === id
      ),
    })
  );
  const group_by_program_id = (result, service) => {
    _.forEach(service.program_ids, (program_id) => {
      result[program_id] = result[program_id]
        ? _.concat(result[program_id], service)
        : [service];
    });
    return result;
  };
  const service_types_lookup = _.chain(
    get_standard_csv_file_rows("service_types_lookup.csv")
  )
    .map(({ code, en, fr }) => [code, { en, fr }])
    .fromPairs()
    .value();
  const populate_type_summary = (services, subject_id) =>
    _.chain(services)
      .flatMap("service_type_code")
      .countBy()
      .map((value, type_code) => ({
        id: `${subject_id}_${type_code}_${value}`,
        subject_id,
        label_en: service_types_lookup[type_code].en,
        label_fr: service_types_lookup[type_code].fr,
        value,
      }))
      .value();
  const gov_type_summary = populate_type_summary(service_rows, "gov");
  const dept_type_summary = _.chain(service_rows)
    .groupBy("org_id")
    .flatMap(populate_type_summary)
    .value();
  const program_type_summary = _.chain(service_rows)
    .reduce(group_by_program_id, {})
    .flatMap(populate_type_summary)
    .value();
  const get_current_status_count = (services, key, value) =>
    _.countBy(services, `${key}_status`)[value] || 0;
  const populate_digital_summary_key = (services, subject_id, level, key) => ({
    id: `${level}_${subject_id}_${key}`,
    key_desc: `${key}_desc`,
    key,
    subject_id,
    can_online: get_current_status_count(services, key, true),
    cannot_online: get_current_status_count(services, key, false),
    not_applicable: get_current_status_count(services, key, null),
  });

  const gov_service_digital_summary = _.chain(digital_status_keys)
    .map((key) => populate_digital_summary_key(service_rows, "gov", "gov", key))
    .sortBy("can_online")
    .value();
  const dept_service_digital_summary = _.chain(service_rows)
    .groupBy("org_id")
    .flatMap((services, org_id) =>
      _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(services, org_id, "dept", key)
      )
    )
    .sortBy("can_online")
    .value();
  const program_service_digital_summary = _.chain(service_rows)
    .reduce(group_by_program_id, {})
    .flatMap((services, program_id) =>
      _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(services, program_id, "program", key)
      )
    )
    .sortBy("can_online")
    .value();

  return await Promise.all([
    ServiceReport.insertMany(service_report_rows),
    StandardReport.insertMany(standard_report_rows),
    ServiceStandard.insertMany(service_standard_rows),
    Service.insertMany(service_rows),
    GovServiceTypeSummary.insertMany(gov_type_summary),
    DeptServiceTypeSummary.insertMany(dept_type_summary),
    ProgramServiceTypeSummary.insertMany(program_type_summary),
    GovServiceDigitalStatusSummary.insertMany(gov_service_digital_summary),
    DeptServiceDigitalStatusSummary.insertMany(dept_service_digital_summary),
    ProgramServiceDigitalStatusSummary.insertMany(
      program_service_digital_summary
    ),
  ]);
}
