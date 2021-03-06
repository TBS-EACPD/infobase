import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { digital_status_keys, delivery_channels_keys } from "./constants.js";

const online_inquiry_count = "online_inquiry_count";

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
    GovServiceSummary,
    OrgServiceSummary,
    ProgramServiceSummary,
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
      service_type_ids,
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
        service_type_ids,
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
      .flatMap("service_type_ids")
      .countBy()
      .map((value, type_code) => ({
        id: `${subject_id}_${type_code}_${value}`,
        subject_id,
        label_en: service_types_lookup[type_code].en,
        label_fr: service_types_lookup[type_code].fr,
        value,
      }))
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
  const get_id_method_count = (services, subject_id) =>
    _.chain(["sin_collected", "cra_business_ids_collected"])
      .map((method) =>
        _.reduce(
          services,
          (sum, service) => {
            const service_id_count = _.countBy(service.service_report, method);
            return {
              method,
              true: sum.true + service_id_count.true || sum.true,
              false: sum.false + service_id_count.false || sum.false,
              null: sum.null + service_id_count.null || sum.null,
            };
          },
          {
            true: 0,
            false: 0,
            null: 0,
          }
        )
      )
      .reduce((result, row) => {
        const method = row.method === "sin_collected" ? "sin" : "cra";
        const uses_identifier_key = `uses_${method}_as_identifier`;
        const does_not_use_identifier_key = `does_not_use_${method}_as_identifier`;
        const not_applicable_key = `${method}_not_applicable`;
        result.push({
          id: `${subject_id}_${uses_identifier_key}`,
          method,
          subject_id,
          label: uses_identifier_key,
          value: row.true,
        });
        result.push({
          id: `${subject_id}_${does_not_use_identifier_key}`,
          method,
          subject_id,
          label: does_not_use_identifier_key,
          value: row.false,
        });
        result.push({
          id: `${subject_id}_${not_applicable_key}`,
          method,
          subject_id,
          label: not_applicable_key,
          value: row.null,
        });
        return result;
      }, [])
      .value();

  const get_services_w_standards_count = (services) =>
    _.chain(services)
      .countBy("standards")
      .filter((value, key) => key)
      .map()
      .sum()
      .value();
  const get_processed_standards = (services) =>
    _.chain(services)
      .flatMap("standards")
      .reject(({ target_type }) => target_type === "Other type of target")
      .flatMap("standard_report")
      .filter("count" || "lower" || "met_count")
      .value();
  const get_final_standards_summary = (services, subject_id) => {
    const services_w_standards_count = get_services_w_standards_count(services);
    const processed_standards = get_processed_standards(services);
    return {
      id: `${subject_id}_standards_summary`,
      subject_id,
      services_w_standards_count,
      standards_count: processed_standards.length,
      met_standards_count: _.countBy(processed_standards, "is_target_met").true,
    };
  };

  const get_fees_summary = (services, subject_id) => {
    const fees_count = _.countBy(services, "collects_fees");
    return [
      {
        id: `${subject_id}_fees`,
        subject_id,
        label: "service_charges_fees",
        value: fees_count.true || 0,
      },
      {
        id: `${subject_id}_no_fees`,
        subject_id,
        label: "service_does_not_charge_fees",
        value: fees_count.false || 0,
      },
    ];
  };

  const get_top_application_vol_summary = (services, subject_id) => {
    return _.chain(services)
      .flatMap(({ id, name_en, name_fr, service_report }) => ({
        id: `${subject_id}_${id}`,
        service_id: id,
        subject_id,
        name_en,
        name_fr,
        value: _.reduce(
          delivery_channels_keys,
          (sum, key) =>
            sum + (_.chain(service_report).sumBy(key).toNumber().value() || 0),
          0
        ),
      }))
      .filter("value")
      .sortBy("value")
      .takeRight(10)
      .value();
  };

  const gov_services_high_volume_summary = _.chain(service_rows)
    .groupBy("org_id")
    .map((services, org_id) => ({
      id: org_id,
      subject_id: org_id,
      total_volume: _.sumBy(services, ({ service_report }) =>
        _.reduce(
          delivery_channels_keys,
          (sum, key) =>
            sum + _.chain(service_report).sumBy(key).toNumber().value() || 0,
          0
        )
      ),
    }))
    // 45,000+ volume is considered "high volume"
    .reject(({ total_volume }) => total_volume <= 45000)
    .sortBy("total_volume")
    .reverse()
    .value();

  const post_process_website_visits = (data) =>
    _.chain(data)
      .filter("website_visits_count")
      .sortBy("website_visits_count")
      .takeRight(10)
      .value();

  const gov_top_website_visits_summary = _.chain(service_rows)
    .groupBy("org_id")
    .map((org_services, org_id) => ({
      id: `gov_${org_id}`,
      subject_id: org_id,
      website_visits_count: _.sumBy(
        org_services,
        ({ service_report }) =>
          _.chain(service_report)
            .sumBy(online_inquiry_count)
            .toNumber()
            .value() || 0
      ),
    }))
    .thru(post_process_website_visits)
    .value();

  const get_top_website_visits_summary = (services, subject_id) =>
    _.chain(services)
      .flatMap(({ id, name_en, name_fr, service_report }) => ({
        id: `${subject_id}_${id}`,
        subject_id,
        service_id: id,
        service_name_en: name_en,
        service_name_fr: name_fr,
        website_visits_count:
          _.chain(service_report)
            .sumBy(online_inquiry_count)
            .toNumber()
            .value() || 0,
      }))
      .value();
  const gov_summary = [
    {
      id: "gov",
      service_general_stats: {
        id: "gov",
        number_of_services: service_rows.length,
      },
      service_type_summary: populate_type_summary(service_rows, "gov"),
      service_digital_status_summary: _.chain(digital_status_keys)
        .map((key) =>
          populate_digital_summary_key(service_rows, "gov", "gov", key)
        )
        .sortBy("can_online")
        .value(),
      service_id_methods_summary: get_id_method_count(service_rows, "gov"),
      service_standards_summary: [
        get_final_standards_summary(service_rows, "gov"),
      ],
      service_fees_summary: get_fees_summary(service_rows, "gov"),
      service_high_volume_summary: gov_services_high_volume_summary,
      top_services_website_visits_summary: gov_top_website_visits_summary,
    },
  ];
  const org_summary = _.chain(service_rows)
    .groupBy("org_id")
    .flatMap((services, org_id) => ({
      id: org_id,
      service_general_stats: {
        id: org_id,
        number_of_services: services.length,
      },
      service_type_summary: populate_type_summary(services, org_id),
      service_digital_status_summary: _.chain(digital_status_keys)
        .flatMap((key) =>
          populate_digital_summary_key(services, org_id, "dept", key)
        )
        .sortBy("can_online")
        .value(),
      service_id_methods_summary: get_id_method_count(services, org_id),
      service_fees_summary: get_fees_summary(services, org_id),
      service_standards_summary: get_final_standards_summary(services, org_id),
      top_services_application_vol_summary: get_top_application_vol_summary(
        services,
        org_id
      ),
      top_services_website_visits_summary: _.chain()
        .thru(() => get_top_website_visits_summary(services, org_id))
        .thru(post_process_website_visits)
        .value(),
    }))
    .value();
  const program_summary = _.chain(service_rows)
    .reduce(group_by_program_id, {})
    .flatMap((services, program_id) => ({
      id: program_id,
      service_general_stats: {
        id: program_id,
        number_of_services: services.length,
      },
      service_type_summary: populate_type_summary(services, program_id),
      service_digital_status_summary: _.chain(digital_status_keys)
        .flatMap((key) =>
          populate_digital_summary_key(services, program_id, "program", key)
        )
        .sortBy("can_online")
        .value(),
      service_id_methods_summary: get_id_method_count(services, program_id),
      service_fees_summary: get_fees_summary(services, program_id),
      service_standards_summary: get_final_standards_summary(
        services,
        program_id
      ),
      top_services_application_vol_summary: get_top_application_vol_summary(
        services,
        program_id
      ),
      top_services_website_visits_summary: _.chain()
        .thru(() => get_top_website_visits_summary(services, program_id))
        .thru(post_process_website_visits)
        .value(),
    }))
    .value();

  return await Promise.all([
    ServiceReport.insertMany(service_report_rows),
    StandardReport.insertMany(standard_report_rows),
    ServiceStandard.insertMany(service_standard_rows),
    Service.insertMany(service_rows),
    GovServiceSummary.insertMany(gov_summary),
    OrgServiceSummary.insertMany(org_summary),
    ProgramServiceSummary.insertMany(program_summary),
  ]);
}
