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
const get_years_from_services = (services) =>
  _.chain(services).flatMap("submission_year").uniq().sort().reverse().value();
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

  const urls = _.chain(get_standard_csv_file_rows("service_urls.csv"))
    .map(
      ({
        dept_submissions__document__year: submission_year,
        service: service_id,
        category,
        value_en,
        value_fr,
      }) => ({ submission_year, service_id, category, value_en, value_fr })
    )
    .groupBy("service_id")
    .value();
  const get_corresponding_urls = (
    urls,
    submission_year,
    category,
    column_name
  ) => {
    const corresponding_urls = _.filter(
      urls,
      (url) =>
        url.submission_year === submission_year && url.category === category
    );
    return {
      [`${column_name}_en`]: _.map(corresponding_urls, "value_en"),
      [`${column_name}_fr`]: _.map(corresponding_urls, "value_fr"),
    };
  };

  const service_report_rows = _.map(
    get_standard_csv_file_rows("service-reports.csv"),
    ({
      service: service_id,
      cra_business_ids_collected,
      sin_collected,
      comment_en: service_report_comment_en,
      comment_fr: service_report_comment_fr,

      ...other_fields
    }) => ({
      service_id,
      cra_business_ids_collected: convert_to_bool_or_null(
        cra_business_ids_collected,
        "YES",
        "NO"
      ),
      sin_collected: convert_to_bool_or_null(sin_collected, "YES", "NO"),
      service_report_comment_en,
      service_report_comment_fr,
      ...other_fields,
    })
  );
  const standard_report_rows = _.map(
    get_standard_csv_file_rows("standard-reports.csv"),
    ({
      is_target_met,
      standard: standard_id,
      comment_en: standard_report_comment_en,
      comment_fr: standard_report_comment_fr,
      ...other_fields
    }) => ({
      is_target_met: convert_to_bool_or_null(is_target_met, "TRUE", "FALSE"),
      standard_id,
      standard_report_comment_en,
      standard_report_comment_fr,
      ...other_fields,
    })
  );

  const service_standard_rows = _.map(
    get_standard_csv_file_rows("standards.csv"),
    ({
      dept_submissions__document__year: submission_year,
      eternal_id: standard_id,
      service: service_id,
      channel__name_en: channel_en,
      channel__name_fr: channel_fr,
      standard_type__name_en: type_en,
      standard_type__name_fr: type_fr,
      ...other_fields
    }) => ({
      standard_id,
      service_id,
      submission_year,
      channel_en,
      channel_fr,
      type_en,
      type_fr,
      ...other_fields,
      ...get_corresponding_urls(
        urls[service_id],
        submission_year,
        "STANDARD",
        "standard_urls"
      ),
      ...get_corresponding_urls(
        urls[service_id],
        submission_year,
        "RTP",
        "rtp_urls"
      ),
      standard_report: _.filter(
        standard_report_rows,
        (standard_report) => standard_report.standard_id === standard_id
      ),
    })
  );

  const service_rows = _.chain(get_standard_csv_file_rows("services.csv"))
    .map((service) => {
      const {
        dept_submissions__document__year: submission_year,
        dept_id: org_id,
        dept__tbs_dept_code: dept_code,
        eternal_id: id,
        collects_fees,
        account_reg_digital_status,
        authentication_status,
        application_digital_status,
        decision_digital_status,
        issuance_digital_status,
        issue_res_digital_status,

        service_type_name_en: service_type_en,
        service_type_name_fr: service_type_fr,
        scope_name_en: scope_en,
        scope_name_fr: scope_fr,
        scope_codes,
        designations_name_en: designations_en,
        designations_name_fr: designations_fr,
        target_groups_name_en: target_groups_en,
        target_groups_name_fr: target_groups_fr,
        programs_activity_code: program_activity_codes,
        feedback_channels_name_en: feedback_channels_en,
        feedback_channels_name_fr: feedback_channels_fr,
        digital_identity_platforms_name_en: digital_identity_platforms_en,
        digital_identity_platforms_name_fr: digital_identity_platforms_fr,
        accessibility_assessors_name_en: accessibility_assessors_en,
        accessibility_assessors_name_fr: accessibility_assessors_fr,
        recipient_type_name_en: recipient_type_en,
        recipient_type_name_fr: recipient_type_fr,
        ...other_fields
      } = service;
      const service_report = _.filter(
        service_report_rows,
        (service_report) => service_report.service_id === id
      );
      return {
        id,
        submission_year,
        org_id,
        collects_fees: convert_to_bool_or_null(collects_fees, "TRUE", "FALSE"),
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

        ...multi_value_string_fields_to_arrays({
          service_type_en,
          service_type_fr,
          scope_en,
          scope_fr,
          scope_codes,
          designations_en,
          designations_fr,
          target_groups_en,
          target_groups_fr,
          feedback_channels_en,
          feedback_channels_fr,
          digital_identity_platforms_en,
          digital_identity_platforms_fr,
          accessibility_assessors_en,
          accessibility_assessors_fr,
          recipient_type_en,
          recipient_type_fr,
        }),
        ...other_fields,
        ...get_corresponding_urls(urls[id], submission_year, "SERVICE", "urls"),

        standards: _.filter(
          service_standard_rows,
          (service_standard) => service_standard.service_id === id
        ),
        service_report,
      };
    })
    .reject((service) => _.isEqual(service.scope_codes, ["internal"])) // SI_TODO This should be done on pipeline.. I think?
    .value();
  const most_recent_year = get_years_from_services(service_rows)[0];

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
    const filtered_services = _.chain(services)
      .flatMap((service) => ({
        ...service,
        standards: _.filter(
          service.standards,
          ({ submission_year }) => submission_year === most_recent_year
        ),
      }))
      .value();
    const services_w_standards_count =
      get_services_w_standards_count(filtered_services);
    const processed_standards = get_processed_standards(
      filtered_services,
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
  const most_recent_filtered_services = _.filter(
    service_rows,
    ({ submission_year }) => submission_year === most_recent_year
  );

  const gov_summary = [
    {
      id: "gov",
      service_general_stats: {
        id: "gov",
        report_years: get_years_from_service_report(
          most_recent_filtered_services
        ),
        number_of_services: most_recent_filtered_services.length,
        number_of_online_enabled_services:
          get_number_of_online_enabled_services(most_recent_filtered_services),
        pct_of_online_client_interaction_pts:
          get_pct_of_online_client_interaction_pts(
            most_recent_filtered_services
          ),
        pct_of_standards_met_high_vol_services:
          get_pct_of_standards_met_high_vol_services(
            most_recent_filtered_services
          ),
        num_of_subject_offering_services: _.chain(most_recent_filtered_services)
          .groupBy("org_id")
          .size()
          .value(),
        num_of_programs_offering_services: _.chain(
          most_recent_filtered_services
        )
          .reduce(group_by_program_id, {})
          .size()
          .value(),
      },
      service_channels_summary: get_service_channels_summary(
        most_recent_filtered_services
      ),
      service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(
          most_recent_filtered_services,
          "gov",
          "gov",
          key
        )
      ),
      service_standards_summary: [
        get_final_standards_summary(most_recent_filtered_services, "gov"),
      ],
      subject_offering_services_summary: get_subject_offering_services_summary(
        _.groupBy(most_recent_filtered_services, "org_id")
      ),
    },
  ];

  const org_summary = _.chain(most_recent_filtered_services)
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
  const program_summary = _.chain(most_recent_filtered_services)
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
