import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

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
  const { ServiceStandard, Service, ServiceReport, StandardReport } = models;

  const service_report_rows = _.map(
    get_standard_csv_file_rows("service-report.csv"),
    ({
      id: standard_id,
      cra_business_ids_collected,
      SIN_collected,
      comment: service_report_comment,

      ...other_fields
    }) => ({
      standard_id,
      cra_business_ids_collected: convert_to_bool_or_null(
        cra_business_ids_collected,
        "Yes",
        "No"
      ),
      SIN_collected: convert_to_bool_or_null(SIN_collected, "Yes", "No"),
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
      id: service_id,
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
      service_id,
      is_active: convert_to_bool_or_null(_.toInteger(is_active), 1, 0),
      collects_fees: convert_to_bool_or_null(collects_fees, "Yes", "No"),
      account_reg_digital_status: convert_to_bool_or_null(
        account_reg_digital_status,
        "Enabled",
        "Not Enabled"
      ),
      authentication_status: convert_to_bool_or_null(
        authentication_status,
        "Enabled",
        "Not Enabled"
      ),
      application_digital_status: convert_to_bool_or_null(
        application_digital_status,
        "Enabled",
        "Not Enabled"
      ),
      decision_digital_status: convert_to_bool_or_null(
        decision_digital_status,
        "Enabled",
        "Not Enabled"
      ),
      issuance_digital_status: convert_to_bool_or_null(
        issuance_digital_status,
        "Enabled",
        "Not Enabled"
      ),
      issue_res_digital_status: convert_to_bool_or_null(
        issue_res_digital_status,
        "Enabled",
        "Not Enabled"
      ),
      program_ids: _.chain(program_ids)
        .split("<>")
        .map((id) => `${dept_code}-${id}`)
        .value(),
      ...multi_value_string_fields_to_arrays({
        service_type_en,
        service_type_fr,
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
      }),
      ...other_fields,

      standards: _.filter(
        service_standard_rows,
        (service_standard) => service_standard.service_id === service_id
      ),
      service_report: _.filter(
        service_report_rows,
        (service_report) => service_report.service_id === service_id
      ),
    })
  );

  return await Promise.all([
    ServiceReport.insertMany(service_report_rows),
    StandardReport.insertMany(standard_report_rows),
    ServiceStandard.insertMany(service_standard_rows),
    Service.insertMany(service_rows),
  ]);
}
