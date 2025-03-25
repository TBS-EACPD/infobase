import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import {
  digital_status_keys,
  application_channels_keys,
  channel_def_en,
  channel_def_fr,
  service_std_type_en,
  service_std_type_fr,
  service_type_en,
  service_type_fr,
} from "./constants.js";

const internal_service = "ISS0";

const key_to_text_def = (definition, list_values) => {
  if (list_values.length > 1) {
    return _.chain(list_values)
      .map((value) => _.get(definition, _.toLower(value)))
      .value();
  } else {
    return _.get(definition, _.toLower(list_values));
  }
};

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
  counts === "no_data" ||
  counts === "not_applicable" ||
  counts === "NA" ||
  counts === "ND"
    ? null
    : counts;

const get_fiscal_yr = (range) => _.split(range, "-")[0];

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

function isvalidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(str);
}

export default async function ({ models }) {
  const {
    Service,
    GovServiceSummary,
    OrgServiceSummary,
    ProgramServiceSummary,
  } = models;

  const service_rows_raw = _.reject(
    get_standard_csv_file_rows("si.csv", ";"),
    (row) => {
      return row.fiscal_yr === "2018-2019" || row.fiscal_yr === "2024-2025";
    }
  );

  const standard_rows_raw = _.reject(
    get_standard_csv_file_rows("ss.csv", ";"),
    (row) => {
      return row.fiscal_yr === "2018-2019" || row.fiscal_yr === "2024-2025";
    }
  );

  const program_rows = get_standard_csv_file_rows("program.csv");

  const program_ids = _.chain(program_rows)
    .map(({ dept_code, activity_code }) => `${dept_code}-${activity_code}`)
    .value();

  const service_urls = _.chain(service_rows_raw)
    .map(
      ({
        fiscal_yr: submission_year,
        service_id,
        service_uri_en: value_en,
        service_uri_fr: value_fr,
      }) => ({
        submission_year: get_fiscal_yr(submission_year),
        service_id,
        value_en: _.filter(_.split(value_en, "<>"), (url) => isvalidURL(url)),
        value_fr: _.filter(_.split(value_fr, "<>"), (url) => isvalidURL(url)),
      })
    )
    .groupBy("service_id")
    .value();

  const standards_urls = _.chain(standard_rows_raw)
    .map(
      ({
        fiscal_yr: submission_year,
        service_id,
        standards_targets_uri_en: value_en,
        standards_targets_uri_fr: value_fr,
      }) => ({
        submission_year: get_fiscal_yr(submission_year),
        service_id,
        value_en: _.filter(_.split(value_en, "<>"), (url) => isvalidURL(url)),
        value_fr: _.filter(_.split(value_fr, "<>"), (url) => isvalidURL(url)),
      })
    )
    .groupBy("service_id")
    .value();

  const get_corresponding_urls = (urls, submission_year, column_name) => {
    const corresponding_urls = _.filter(
      urls,
      (url) => url.submission_year === submission_year
    );
    return {
      [`${column_name}_en`]: _.flatMap(corresponding_urls, "value_en"),
      [`${column_name}_fr`]: _.flatMap(corresponding_urls, "value_fr"),
    };
  };

  const service_report_rows = _.map(
    service_rows_raw,
    ({
      fiscal_yr: year,
      service_id,
      cra_bn_identifier_usage: cra_business_ids_collected,
      sin_usage: sin_collected,
      num_phone_enquiries: phone_inquiry_count,
      num_website_visits: online_inquiry_count,
      num_applications_by_phone: phone_application_count,
      num_applications_online: online_application_count,
      num_applications_in_person: live_application_count,
      num_applications_by_mail: mail_application_count,
      num_applications_by_email: email_application_count,
      num_applications_by_fax: fax_application_count,
      num_applications_by_other: other_application_count,
    }) => {
      return {
        year: get_fiscal_yr(year),
        service_id,
        cra_business_ids_collected: convert_to_bool_or_null(
          cra_business_ids_collected,
          "Y",
          "N"
        ),
        sin_collected: convert_to_bool_or_null(sin_collected, "Y", "N"),
        phone_inquiry_and_application_count: no_data_or_na_to_null(
          _.sum(phone_application_count, phone_inquiry_count)
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
      };
    }
  );

  const standard_report_rows = _.map(
    standard_rows_raw,
    ({
      target_met: is_target_met,
      service_standard_id: standard_id,
      comments_en: standard_report_comment_en,
      comments_fr: standard_report_comment_fr,
      fiscal_yr: year,
      target: lower,
      volume_meeting_target: met_count,
      total_volume: count,
    }) => ({
      is_target_met: convert_to_bool_or_null(is_target_met, "Y", "N"),
      standard_id,
      standard_report_comment_en,
      standard_report_comment_fr,
      year: get_fiscal_yr(year),
      lower: lower * 100,
      met_count,
      count,
    })
  );

  const service_standard_rows = _.map(
    standard_rows_raw,
    ({
      fiscal_yr: submission_year,
      service_standard_id: standard_id,
      service_id,
      channel,
      type,
      service_standard_en: name_en,
      service_standard_fr: name_fr,
    }) => ({
      standard_id,
      service_id,
      submission_year: get_fiscal_yr(submission_year),
      channel,
      channel_en: key_to_text_def(channel_def_en, [channel]),
      channel_fr: key_to_text_def(channel_def_fr, [channel]),
      type,
      type_en: key_to_text_def(service_std_type_en, [type]),
      type_fr: key_to_text_def(service_std_type_fr, [type]),
      name_en,
      name_fr,
      ...get_corresponding_urls(
        standards_urls[service_id],
        get_fiscal_yr(submission_year),
        "standard_urls"
      ),
      standard_report: _.filter(
        standard_report_rows,
        (standard_report) => standard_report.standard_id === standard_id
      ),
    })
  );

  const absolute_most_recent_submission_year = _.chain(service_rows_raw)
    .map(({ fiscal_yr }) => get_fiscal_yr(fiscal_yr))
    .uniq()
    .sort()
    .last()
    .value();

  const unique_dept_codes = _.chain(service_rows_raw)
    .map("org_id")
    .uniq()
    .sort()
    .value();

  const dept_code_by_dept_id = _.chain(get_standard_csv_file_rows("igoc.csv"))
    .map(({ org_id, dept_code }) => [org_id, dept_code])
    .fromPairs()
    .value();

  const program_activity_codes_formatter = (program_activity_codes, org_id) =>
    _.chain(program_activity_codes)
      .split(",")
      .map((id) =>
        _.includes(id, "ISS")
          ? id &&
            `${dept_code_by_dept_id[org_id]}-${internal_service.concat(
              id.slice(-1)
            )}`
          : id && `${dept_code_by_dept_id[org_id]}-${id}`
      )
      .compact()
      .value();

  const services_missing_program_ids = _.chain(service_rows_raw)
    .filter(
      ({ fiscal_yr }) =>
        get_fiscal_yr(fiscal_yr) === absolute_most_recent_submission_year
    )
    .map(
      ({
        service_id: id,
        service_name_en: name_en,
        service_name_fr: name_fr,
        fiscal_yr: submission_year,
        org_id,
        program_id: program_activity_codes,
      }) => ({
        id,
        name_en,
        name_fr,
        submission_year: get_fiscal_yr(submission_year),
        org_id,
        dept_code: dept_code_by_dept_id[org_id],
        program_activity_codes: program_activity_codes_formatter(
          program_activity_codes,
          org_id
        ).filter(
          (value) => !program_ids.includes(value) && !_.includes(value, "ISS")
        ),
      })
    )
    .filter((row) => !_.isEmpty(row.program_activity_codes))
    .value();

  const filtered_service_rows = _.chain(service_rows_raw)
    .map((service) => {
      const {
        fiscal_yr: submission_year,
        org_id,
        service_id: id,
        service_name_en: name_en,
        service_name_fr: name_fr,
        service_description_en: description_en,
        service_description_fr: description_fr,
        service_fee: collects_fees,
        os_account_registration: account_reg_digital_status,
        os_authentication: authentication_status,
        os_application: application_digital_status,
        os_decision: decision_digital_status,
        os_issuance: issuance_digital_status,
        os_issue_resolution_feedback: issue_res_digital_status,

        service_type,
        program_id: program_activity_codes,
        os_comments_client_interaction_en: digital_enablement_comment_en,
        os_comments_client_interaction_fr: digital_enablement_comment_fr,
      } = service;

      const service_report = _.chain(service_report_rows)
        .filter((service_report) => service_report.service_id === id)
        .sortBy("year")
        .value();
      const standards = _.chain(service_standard_rows)
        .filter((service_standard) => service_standard.service_id === id)
        .sortBy("submission_year")
        .value();

      return {
        id,
        submission_year: get_fiscal_yr(submission_year),
        org_id,
        name_en,
        name_fr,
        description_en,
        description_fr,
        collects_fees: convert_to_bool_or_null(collects_fees, "Y", "N"),
        account_reg_digital_status: convert_to_bool_or_null(
          account_reg_digital_status,
          "Y",
          "N"
        ),
        authentication_status: convert_to_bool_or_null(
          authentication_status,
          "Y",
          "N"
        ),
        application_digital_status: convert_to_bool_or_null(
          application_digital_status,
          "Y",
          "N"
        ),
        decision_digital_status: convert_to_bool_or_null(
          decision_digital_status,
          "Y",
          "N"
        ),
        issuance_digital_status: convert_to_bool_or_null(
          issuance_digital_status,
          "Y",
          "N"
        ),
        issue_res_digital_status: convert_to_bool_or_null(
          issue_res_digital_status,
          "Y",
          "N"
        ),
        report_years: get_years_from_service_report([{ service_report }]),
        all_program_activity_codes: program_activity_codes_formatter(
          program_activity_codes,
          org_id
        ),
        program_activity_codes:
          _.difference(
            program_activity_codes_formatter(program_activity_codes, org_id),
            program_ids
          ).length == 0
            ? program_activity_codes_formatter(program_activity_codes, org_id)
            : [],
        is_missing_program_activity_codes: services_missing_program_ids.some(
          (service) => service["id"] === id
        ),

        service_type_code: service_type,
        service_type_en: key_to_text_def(
          service_type_en,
          _.split(service_type, ", ")
        ),
        service_type_fr: key_to_text_def(
          service_type_fr,
          _.split(service_type, ", ")
        ),

        digital_enablement_comment_en,
        digital_enablement_comment_fr,
        ...get_corresponding_urls(
          service_urls[id],
          get_fiscal_yr(submission_year),
          "urls"
        ),
        standards,
        service_report,
      };
    })
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

  const org_w_services_missing_program_ids = _.chain(
    services_missing_program_ids
  )
    .map((service) => service.org_id)
    .compact()
    .uniq()
    .sort()
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

  const get_missing_departments_per_year = () => {
    const all_report_years = get_years_from_service_report(
      absolute_most_recent_year_filtered_services
    );

    const report_years_per_org_id = _.chain(filtered_service_rows)
      .groupBy("org_id")
      .flatMap((services, org_id) => {
        const years = get_years_from_service_report(services);
        return {
          org_id: org_id,
          report_years: years,
        };
      })
      .value();

    return _.filter(
      report_years_per_org_id,
      ({ report_years }) => report_years.length !== all_report_years.length
    );
  };

  const gov_summary = [
    {
      id: "gov",
      depts_missing_program_ids: org_w_services_missing_program_ids,
      services_missing_program_ids: services_missing_program_ids,
      service_general_stats: {
        report_years: get_years_from_service_report(
          absolute_most_recent_year_filtered_services
        ),
        all_report_years: get_years_from_service_report(
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
      list_of_missing_dept: get_missing_departments_per_year(),
      service_channels_summary: get_service_channels_summary(
        filtered_service_rows
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
        depts_missing_program_ids: org_w_services_missing_program_ids,
        services_missing_program_ids: _.filter(
          services_missing_program_ids,
          (row) => row.org_id === org_id
        ),
        service_general_stats: {
          report_years: get_years_from_service_report(filtered_services),
          all_report_years: get_years_from_service_report(
            absolute_most_recent_year_filtered_services
          ),
          standard_years: get_years_from_service_standards(filtered_services),
          number_of_services: filtered_services.length,
          number_of_services_w_program: _.filter(
            filtered_services,
            (row) => !_.isEmpty(row.program_activity_codes)
          ).length,
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
        service_channels_summary: get_service_channels_summary(services),
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
        list_of_missing_dept: get_missing_departments_per_year(),
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
          all_report_years: get_years_from_service_report(
            absolute_most_recent_year_filtered_services
          ),
          standard_years: get_years_from_service_standards(filtered_services),
          number_of_services: filtered_services.length,
          number_of_online_enabled_services:
            get_number_of_online_enabled_services(filtered_services),
          pct_of_online_client_interaction_pts:
            get_pct_of_online_client_interaction_pts(filtered_services),
        },
        service_channels_summary: get_service_channels_summary(services),
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
        list_of_missing_dept: get_missing_departments_per_year(),
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
