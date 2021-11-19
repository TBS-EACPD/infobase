import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { digital_status_keys, application_channels_keys } from "./constants.js";

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
const get_years_from_service_report = (services) =>
  _.chain(services)
    .flatMap(({ service_report }) => _.map(service_report, "year"))
    .uniq()
    .sort()
    .reverse()
    .value();
const get_years_from_service_standards = (services) =>
  _.chain(services)
    .flatMap("standards")
    .flatMap(({ standard_report }) => _.map(standard_report, "year"))
    .uniq()
    .sort()
    .reverse()
    .value();

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

  const service_rows = _.chain(get_standard_csv_file_rows("services.csv"))
    .map((service) => {
      const {
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

        name_en,
        name_fr,
        service_type_en,
        service_type_fr,
        service_type_codes,
        scope_en,
        scope_fr,
        scope_codes,
        designations_en,
        designations_fr,
        target_groups_en,
        target_groups_fr,
        program_activity_codes,
        feedback_channels_en,
        feedback_channels_fr,
        urls_en,
        urls_fr,

        ...other_fields
      } = service;
      const service_report = _.filter(
        service_report_rows,
        (service_report) => service_report.service_id === id
      );
      return {
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
        report_years: get_years_from_service_report([{ service_report }]),
        program_activity_codes: _.chain(program_activity_codes)
          .split("<>")
          .map((id) => id && `${dept_code}-${id}`)
          .compact()
          .value(),

        name_en,
        name_fr,
        search_text_en: _.deburr(name_en),
        search_text_fr: _.deburr(name_fr),
        ...multi_value_string_fields_to_arrays({
          service_type_en,
          service_type_fr,
          service_type_codes,
          scope_en,
          scope_fr,
          scope_codes,
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
        service_report,
      };
    })
    .reject((service) => _.isEqual(service.scope_codes, ["internal"])) // SI_TODO This should be done on pipeline.. I think?
    .value();

  const group_by_program_id = (result, service) => {
    _.forEach(service.program_activity_codes, (program_id) => {
      result[program_id] = result[program_id]
        ? _.concat(result[program_id], service)
        : [service];
    });
    return result;
  };
  const get_current_status_count = (services, key, value) =>
    _.countBy(services, `${key}_status`)[value] || 0;
  const populate_digital_summary_key = (
    services,
    subject_id,
    subject_type,
    key
  ) => ({
    id: `${subject_type}_${subject_id}_${key}`,
    key_desc: `${key}_desc`,
    key,
    subject_id,
    can_online: get_current_status_count(services, key, true),
    cannot_online: get_current_status_count(services, key, false),
    not_applicable: get_current_status_count(services, key, null),
  });

  const get_services_w_standards_count = (services) =>
    _.chain(services)
      .countBy("standards")
      .filter((value, key) => key)
      .map()
      .sum()
      .value();
  const get_processed_standards = (services, year) =>
    _.chain(services)
      .flatMap("standards")
      .reject(({ target_type }) => target_type === "Other type of target")
      .flatMap("standard_report")
      .filter(
        (report) =>
          report.year === year &&
          (report.count || report.lower || report.met_count)
      )
      .value();
  const get_final_standards_summary = (services, subject_id) => {
    const services_w_standards_count = get_services_w_standards_count(services);
    const most_recent_year = get_years_from_service_standards(services)[0];
    const processed_standards = get_processed_standards(
      services,
      most_recent_year
    );
    return {
      id: `${subject_id}_standards_summary`,
      subject_id,
      services_w_standards_count,
      standards_count: processed_standards.length,
      met_standards_count: _.countBy(processed_standards, "is_target_met").true,
    };
  };
  const get_subject_offering_services_summary = (grouped_services) =>
    _.chain(grouped_services)
      .map((services, org_id) => {
        const most_recent_year = get_years_from_service_report(services)[0];
        return {
          id: org_id,
          subject_id: org_id,
          number_of_services: services.length,
          total_volume: _.sumBy(services, ({ service_report }) =>
            _.reduce(
              application_channels_keys,
              (sum, key) =>
                sum +
                  _.chain(service_report)
                    .filter((report) => report.year === most_recent_year)
                    .sumBy(key)
                    .toNumber()
                    .value() || 0,
              0
            )
          ),
        };
      })
      .sortBy("total_volume")
      .reverse()
      .value();

  const get_number_of_online_enabled_services = (services) =>
    _.reduce(
      services,
      (sum, service) => {
        const is_online_enabled_service = (() => {
          const is_all_not_applicable_service = _.reduce(
            digital_status_keys,
            (is_not_applicable_service, key) =>
              is_not_applicable_service
                ? service[`${key}_status`] === null
                : false,
            true
          );
          if (is_all_not_applicable_service) {
            return false;
          }
          return _.reduce(
            digital_status_keys,
            (is_online_enabled_service, key) =>
              is_online_enabled_service
                ? service[`${key}_status`] !== false
                : false,
            true
          );
        })();
        return is_online_enabled_service ? sum + 1 : sum;
      },
      0
    );
  const get_number_of_online_enabled_interaction_pts = (services) =>
    _.reduce(
      services,
      (sum, service) => {
        const number_of_online_enabled_interaction_pts = _.reduce(
          digital_status_keys,
          (interaction_pts_sum, key) =>
            service[`${key}_status`]
              ? interaction_pts_sum + 1
              : interaction_pts_sum,
          0
        );
        return sum + number_of_online_enabled_interaction_pts;
      },
      0
    );
  const get_total_interaction_pts = (services) =>
    _.reduce(
      services,
      (sum, service) => {
        const number_of_valid_interaction_pts = _.reduce(
          digital_status_keys,
          (interaction_pts_sum, key) =>
            _.isNull(service[`${key}_status`])
              ? interaction_pts_sum
              : interaction_pts_sum + 1,
          0
        );
        return sum + number_of_valid_interaction_pts;
      },
      0
    );
  const get_pct_of_online_client_interaction_pts = (services) =>
    get_number_of_online_enabled_interaction_pts(services) /
      get_total_interaction_pts(services) || 0;

  const get_pct_of_standards_met_high_vol_services = (services) => {
    const most_recent_year = get_years_from_service_standards(services)[0];
    const high_vol_services = _.filter(
      services,
      (service) =>
        _.reduce(
          application_channels_keys,
          (sum, key) => sum + _.last(service.service_report)[key],
          0
        ) >= 45000 // filter for high volume services
    );
    const processed_standards = get_processed_standards(
      high_vol_services,
      most_recent_year
    );
    return (
      _.countBy(processed_standards, "is_target_met").true /
        processed_standards.length || 0
    );
  };

  const get_service_channels_summary = (services) =>
    _.chain(services)
      .flatMap((service) =>
        _.map(service.service_report, (report) => ({
          ...report,
          subject_id: service.org_id,
        }))
      )
      .groupBy("year")
      .flatMap((reports, year) =>
        _.map(application_channels_keys, (key) => ({
          id: _.uniqueId(),
          subject_id: reports[0].subject_id,
          year,
          channel_id: key,
          channel_value: _.reduce(
            reports,
            (sum, report) => sum + _.toNumber(report[key]) || 0,
            0
          ),
        }))
      )
      .value();

  const gov_summary = [
    {
      id: "gov",
      service_general_stats: {
        id: "gov",
        report_years: get_years_from_service_report(service_rows),
        number_of_services: service_rows.length,
        number_of_online_enabled_services:
          get_number_of_online_enabled_services(service_rows),
        pct_of_online_client_interaction_pts:
          get_pct_of_online_client_interaction_pts(service_rows),
        pct_of_standards_met_high_vol_services:
          get_pct_of_standards_met_high_vol_services(service_rows),
        num_of_subject_offering_services: _.chain(service_rows)
          .groupBy("org_id")
          .size()
          .value(),
        num_of_programs_offering_services: _.chain(service_rows)
          .reduce(group_by_program_id, {})
          .size()
          .value(),
      },
      service_channels_summary: get_service_channels_summary(service_rows),
      service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(service_rows, "gov", "gov", key)
      ),
      service_standards_summary: [
        get_final_standards_summary(service_rows, "gov"),
      ],
      subject_offering_services_summary: get_subject_offering_services_summary(
        _.groupBy(service_rows, "org_id")
      ),
    },
  ];
  const org_summary = _.chain(service_rows)
    .groupBy("org_id")
    .flatMap((services, org_id) => ({
      id: org_id,
      service_general_stats: {
        id: org_id,
        report_years: get_years_from_service_report(services),
        number_of_services: services.length,
        number_of_online_enabled_services:
          get_number_of_online_enabled_services(services),
        pct_of_online_client_interaction_pts:
          get_pct_of_online_client_interaction_pts(services),
        pct_of_standards_met_high_vol_services:
          get_pct_of_standards_met_high_vol_services(services),
        num_of_programs_offering_services: _.chain(services)
          .reduce(group_by_program_id, {})
          .size()
          .value(),
      },
      service_channels_summary: get_service_channels_summary(services),
      service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(services, org_id, "dept", key)
      ),
      service_standards_summary: get_final_standards_summary(services, org_id),
      subject_offering_services_summary: get_subject_offering_services_summary(
        _.reduce(services, group_by_program_id, {})
      ),
    }))
    .value();
  const program_summary = _.chain(service_rows)
    .reduce(group_by_program_id, {})
    .flatMap((services, program_id) => ({
      id: program_id,
      service_general_stats: {
        id: program_id,
        report_years: get_years_from_service_report(services),
        number_of_services: services.length,
        number_of_online_enabled_services:
          get_number_of_online_enabled_services(services),
        pct_of_online_client_interaction_pts:
          get_pct_of_online_client_interaction_pts(services),
      },
      service_channels_summary: get_service_channels_summary(services),
      service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(services, program_id, "program", key)
      ),
      service_standards_summary: get_final_standards_summary(
        services,
        program_id
      ),
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
