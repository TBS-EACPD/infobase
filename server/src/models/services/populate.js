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
const no_data_or_na_to_null = (counts) =>
  counts === "no_data" || counts === "not_applicable" ? null : counts;

const combine_other_fax_email_counts = (
  other_counts,
  fax_counts,
  email_counts
) => {
  const num_other_counts = no_data_or_na_to_null(other_counts);
  const num_fax_counts = no_data_or_na_to_null(fax_counts);
  const num_email_counts = no_data_or_na_to_null(email_counts);

  const total =
    (num_other_counts === null ? null : parseInt(num_other_counts)) +
    (num_fax_counts === null ? null : parseInt(num_fax_counts)) +
    (num_email_counts === null ? null : parseInt(num_email_counts));

  return total === 0 ? null : total;
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
    Service,
    GovServiceSummary,
    OrgServiceSummary,
    ProgramServiceSummary,
  } = models;

  const urls = _.chain(get_standard_csv_file_rows("service-urls.csv"))
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
      phone_inquiry_and_application_count,
      phone_inquiry_count,
      online_inquiry_count,
      phone_application_count,
      online_application_count,
      live_application_count,
      mail_application_count,
      email_application_count,
      fax_application_count,
      other_application_count,
      ...other_fields
    }) => {
      return {
        service_id,
        cra_business_ids_collected: convert_to_bool_or_null(
          cra_business_ids_collected,
          "YES",
          "NO"
        ),
        sin_collected: convert_to_bool_or_null(sin_collected, "YES", "NO"),
        service_report_comment_en,
        service_report_comment_fr,
        phone_inquiry_and_application_count: no_data_or_na_to_null(
          phone_inquiry_and_application_count
        ),
        phone_inquiry_count: no_data_or_na_to_null(phone_inquiry_count),
        online_inquiry_count: no_data_or_na_to_null(online_inquiry_count),
        phone_application_count: no_data_or_na_to_null(phone_application_count),
        online_application_count: no_data_or_na_to_null(
          online_application_count
        ),
        live_application_count: no_data_or_na_to_null(live_application_count),
        mail_application_count: no_data_or_na_to_null(mail_application_count),
        email_application_count: no_data_or_na_to_null(email_application_count),
        fax_application_count: no_data_or_na_to_null(fax_application_count),
        other_application_count: combine_other_fax_email_counts(
          other_application_count,
          fax_application_count,
          email_application_count
        ),
        ...other_fields,
      };
    }
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
      is_target_met: convert_to_bool_or_null(is_target_met, "1", "0"),
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

  const raw_service_rows = get_standard_csv_file_rows("services.csv");
  const absolute_most_recent_submission_year = _.chain(raw_service_rows)
    .map("dept_submissions__document__year")
    .uniq()
    .sort()
    .last()
    .value();

  const unique_dept_codes = _.chain(raw_service_rows)
    .map("dept_code")
    .uniq()
    .sort()
    .value();

  const dept_id_by_dept_code = _.chain(get_standard_csv_file_rows("igoc.csv"))
    .map(({ org_id, dept_code }) => [dept_code, org_id])
    .fromPairs()
    .value();

  const filtered_service_rows = _.chain(raw_service_rows)
    .map((service) => {
      const {
        dept_submissions__document__year: submission_year,
        dept_code,
        eternal_id: id,
        collects_fees,
        account_reg_digital_status,
        authentication_status,
        application_digital_status,
        decision_digital_status,
        issuance_digital_status,
        issue_res_digital_status,
        last_accessibility_review,
        last_improve_from_feedback,
        last_gender_analysis,

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
      const standards = _.filter(
        service_standard_rows,
        (service_standard) => service_standard.service_id === id
      );

      return {
        id,
        submission_year,
        org_id: dept_id_by_dept_code[dept_code],
        collects_fees: convert_to_bool_or_null(
          collects_fees.toLowerCase(),
          "true",
          "false"
        ),
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
        last_accessibility_review: last_accessibility_review
          ? _.toInteger(last_accessibility_review)
          : last_accessibility_review,
        last_improve_from_feedback: last_improve_from_feedback
          ? _.toInteger(last_improve_from_feedback)
          : last_improve_from_feedback,
        last_gender_analysis: last_gender_analysis
          ? _.toInteger(last_gender_analysis)
          : last_gender_analysis,

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
        standards,
        service_report,
      };
    })
    .reject((service) => _.isEqual(service.scope_codes, ["internal"]))
    // SI_TODO oof, big mess, need to refactor a lot of stuff to support multiple years of service data. For now, just take the latest submitted version
    // (the client was, generally, doing this in a bunch of places manually already, so this is more of a cleanup than a hack for now)
    .groupBy("id")
    // Filter by relatively most recent services (e.g.: absolute most recent year could be 2020 but a service may not have submitted in 2020, hence relatively most recent year is 2019)
    .map((service_across_years) =>
      _.chain(service_across_years)
        .sortBy(({ submission_year }) => _.toInteger(submission_year))
        .last()
        .value()
    )
    // only valid under above logic, will need to rework active status deterination in multi-year refactor
    .each((service) => {
      service.is_active =
        service.submission_year === absolute_most_recent_submission_year;
    })
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
    const standard_years = get_years_from_service_standards(services);
    return _.map(standard_years, (year) => {
      const services_for_this_year = _.flatMap(services, (service) => ({
        ...service,
        standards: _.filter(
          service.standards,
          ({ submission_year }) => submission_year === year
        ),
      }));
      const services_w_standards_count = get_services_w_standards_count(
        services_for_this_year
      );
      const processed_standards = get_processed_standards(
        services_for_this_year,
        year
      );
      return {
        subject_id,
        year,
        services_w_standards_count,
        standards_count: processed_standards.length,
        met_standards_count: _.countBy(processed_standards, "is_target_met")
          .true,
      };
    });
  };
  const get_subject_offering_services_summary = (grouped_services) =>
    _.chain(grouped_services)
      .map((services, org_id) => {
        const most_recent_submission_year =
          get_years_from_service_report(services)[0];
        return {
          subject_id: org_id,
          number_of_services: services.length,
          total_volume: _.sumBy(services, ({ service_report }) =>
            _.reduce(
              application_channels_keys,
              (sum, key) =>
                sum +
                  _.chain(service_report)
                    .filter(
                      (report) => report.year === most_recent_submission_year
                    )
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
    const most_recent_submission_year =
      get_years_from_service_standards(services)[0];
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
      most_recent_submission_year
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
  const absolute_most_recent_year_filtered_services = _.filter(
    filtered_service_rows,
    ({ submission_year }) =>
      submission_year === absolute_most_recent_submission_year
  );

  const gov_summary = [
    {
      id: "gov",
      service_general_stats: {
        report_years: get_years_from_service_report(
          absolute_most_recent_year_filtered_services
        ),
        standard_years: get_years_from_service_standards(
          absolute_most_recent_year_filtered_services
        ),
        number_of_services: absolute_most_recent_year_filtered_services.length,
        number_of_online_enabled_services:
          get_number_of_online_enabled_services(
            absolute_most_recent_year_filtered_services
          ),
        pct_of_online_client_interaction_pts:
          get_pct_of_online_client_interaction_pts(
            absolute_most_recent_year_filtered_services
          ),
        pct_of_standards_met_high_vol_services:
          get_pct_of_standards_met_high_vol_services(
            absolute_most_recent_year_filtered_services
          ),
        num_of_subject_offering_services: _.chain(unique_dept_codes)
          .size()
          .value(),
        num_of_programs_offering_services: _.chain(
          absolute_most_recent_year_filtered_services
        )
          .reduce(group_by_program_id, {})
          .size()
          .value(),
      },
      service_channels_summary: get_service_channels_summary(
        absolute_most_recent_year_filtered_services
      ),
      service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
        populate_digital_summary_key(
          absolute_most_recent_year_filtered_services,
          "gov",
          "gov",
          key
        )
      ),
      service_standards_summary: get_final_standards_summary(
        absolute_most_recent_year_filtered_services,
        "gov"
      ),
      subject_offering_services_summary: get_subject_offering_services_summary(
        _.groupBy(absolute_most_recent_year_filtered_services, "org_id")
      ),
    },
  ];

  const org_summary = _.chain(filtered_service_rows)
    .groupBy("org_id")
    .flatMap((services, org_id) => {
      const most_recent_year_for_this_org = _.chain(services)
        .sortBy(({ submission_year }) => _.toInteger(submission_year))
        .last()
        .value().submission_year;
      const filtered_services = _.filter(services, {
        submission_year: most_recent_year_for_this_org,
      });
      return {
        id: org_id,
        service_general_stats: {
          report_years: get_years_from_service_report(filtered_services),
          standard_years: get_years_from_service_standards(filtered_services),
          number_of_services: filtered_services.length,
          number_of_online_enabled_services:
            get_number_of_online_enabled_services(filtered_services),
          pct_of_online_client_interaction_pts:
            get_pct_of_online_client_interaction_pts(filtered_services),
          pct_of_standards_met_high_vol_services:
            get_pct_of_standards_met_high_vol_services(filtered_services),
          num_of_programs_offering_services: _.chain(filtered_services)
            .reduce(group_by_program_id, {})
            .size()
            .value(),
        },
        service_channels_summary:
          get_service_channels_summary(filtered_services),
        service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
          populate_digital_summary_key(filtered_services, org_id, "dept", key)
        ),
        service_standards_summary: get_final_standards_summary(
          filtered_services,
          org_id
        ),
        subject_offering_services_summary:
          get_subject_offering_services_summary(
            _.reduce(filtered_services, group_by_program_id, {})
          ),
      };
    })
    .value();
  const program_summary = _.chain(filtered_service_rows)
    .reduce(group_by_program_id, {})
    .flatMap((services, program_id) => {
      const most_recent_year_for_this_program = _.chain(services)
        .sortBy(({ submission_year }) => _.toInteger(submission_year))
        .last()
        .value().submission_year;
      const filtered_services = _.filter(services, {
        submission_year: most_recent_year_for_this_program,
      });
      return {
        id: program_id,
        service_general_stats: {
          report_years: get_years_from_service_report(filtered_services),
          standard_years: get_years_from_service_standards(filtered_services),
          number_of_services: filtered_services.length,
          number_of_online_enabled_services:
            get_number_of_online_enabled_services(filtered_services),
          pct_of_online_client_interaction_pts:
            get_pct_of_online_client_interaction_pts(filtered_services),
        },
        service_channels_summary:
          get_service_channels_summary(filtered_services),
        service_digital_status_summary: _.flatMap(digital_status_keys, (key) =>
          populate_digital_summary_key(
            filtered_services,
            program_id,
            "program",
            key
          )
        ),
        service_standards_summary: get_final_standards_summary(
          filtered_services,
          program_id
        ),
      };
    })
    .value();

  return await Promise.all([
    Service.insertMany(filtered_service_rows),
    GovServiceSummary.insertMany(gov_summary),
    OrgServiceSummary.insertMany(org_summary),
    ProgramServiceSummary.insertMany(program_summary),
  ]);
}
