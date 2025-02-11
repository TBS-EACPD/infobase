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
  scope_def_en,
  scope_def_fr,
  target_group_en,
  target_group_fr,
  accessibility_assessors_en,
  accessibility_assessors_fr,
  service_recipient_type_en,
  service_recipient_type_fr,
} from "./constants.js";

// The space after the comma is done intentionally, don't remove it
const multi_value_string_fields_to_array = (list_fields, seperator = ", ") => {
  return _.split(list_fields, seperator);
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

const split_year = (value) => {
  const year = _.chain(value).split("-").first().value();
  return _.toInteger(year) === 0 ? null : year;
};

const key_to_text_def = (definition, list_values) => {
  if (list_values.length > 1) {
    return _.chain(list_values)
      .map((value) => _.get(definition, _.toLower(value)))
      .value();
  } else {
    return _.get(definition, _.toLower(list_values));
  }
};

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

  const raw_service_rows = _.reject(
    get_standard_csv_file_rows("hist_service_inventory.csv"),
    { fiscal_yr: "2018-2019" }
  );

  const current_raw_service_rows = get_standard_csv_file_rows(
    "service_inventory.csv"
  );

  const raw_standard_rows = _.reject(
    get_standard_csv_file_rows("hist_service_standards.csv"),
    { fiscal_yr: "2018-2019" }
  );

  const current_standard_rows = get_standard_csv_file_rows(
    "service_standards.csv"
  );

  const service_program_id_rows = get_standard_csv_file_rows(
    "goc_service_program.csv"
  );

  const org_variants_rows = get_standard_csv_file_rows("goc_org_variants.csv");

  const igoc_rows = get_standard_csv_file_rows("igoc.csv");

  const program_rows = get_standard_csv_file_rows("program.csv");

  const program_ids = _.chain(program_rows)
    .map(({ dept_code, activity_code }) => `${dept_code}-${activity_code}`)
    .value();

  const get_urls = (key_en, key_fr, doc) => {
    return _.chain(doc)
      .map(
        ({
          fiscal_yr: submission_year,
          service_id,
          [`${key_en}`]: value_en,
          [`${key_fr}`]: value_fr,
        }) => ({
          submission_year: split_year(submission_year),
          service_id,
          value_en,
          value_fr,
        })
      )
      .groupBy("service_id")
      .value();
  };

  const hist_service_urls = get_urls(
    "service_url_en",
    "service_url_fr",
    raw_service_rows
  );

  const current_service_urls = get_urls(
    "service_uri_en",
    "service_uri_fr",
    current_raw_service_rows
  );

  const hist_standard_urls = get_urls(
    "service_std_url_en",
    "service_std_url_fr",
    raw_standard_rows
  );

  const current_standard_urls = get_urls(
    "standards_targets_uri_en",
    "standards_targets_uri_fr",
    current_standard_rows
  );

  const get_corresponding_urls = (urls, submission_year, column_name) => {
    const corresponding_urls = _.filter(
      urls,
      (url) => url.submission_year === submission_year
    );

    return {
      [`${column_name}_en`]: _.map(corresponding_urls, "value_en"),
      [`${column_name}_fr`]: _.map(corresponding_urls, "value_fr"),
    };
  };

  const hist_service_report_rows = _.map(
    raw_service_rows,
    ({
      fiscal_yr: year,
      service_id,
      use_of_cra_number: cra_business_ids_collected,
      use_of_sin_number: sin_collected,
      special_remarks_en: service_report_comment_en,
      special_remarks_fr: service_report_comment_fr,
      calls_received: phone_inquiry_count,
      web_visits: online_inquiry_count,
      telephone_applications: phone_application_count,
      online_applications: online_application_count,
      in_person_applications: live_application_count,
      postal_mail_applications: mail_application_count,
      email_applications: email_application_count,
      fax_applications: fax_application_count,
      other_applications: other_application_count,
    }) => {
      return {
        year: split_year(year),
        service_id,
        cra_business_ids_collected: convert_to_bool_or_null(
          cra_business_ids_collected,
          "Y",
          "N"
        ),
        sin_collected: convert_to_bool_or_null(sin_collected, "Y", "N"),
        service_report_comment_en,
        service_report_comment_fr,
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

  const current_service_report_rows = _.map(
    current_raw_service_rows,
    ({
      fiscal_yr: year,
      service_id,
      cra_bn_identifier_usage: cra_business_ids_collected,
      sin_usage: sin_collected,
      special_remarks_en: service_report_comment_en,
      special_remarks_fr: service_report_comment_fr,
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
        year: split_year(year),
        service_id,
        cra_business_ids_collected: convert_to_bool_or_null(
          cra_business_ids_collected,
          "Y",
          "N"
        ),
        sin_collected: convert_to_bool_or_null(sin_collected, "Y", "N"),
        service_report_comment_en,
        service_report_comment_fr,
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

  const combine_service_report_rows = _.concat(
    hist_service_report_rows,
    current_service_report_rows
  );

  const hist_standard_report_rows = _.map(
    raw_standard_rows,
    ({
      target_met: is_target_met,
      service_std_id: standard_id,
      standard_comment_en,
      standard_comment_fr,
      fiscal_yr: year,
      service_std_target: lower,
      volume_meeting_target: met_count,
      total_volume: count,
    }) => ({
      is_target_met: convert_to_bool_or_null(is_target_met, "Y", "N"),
      standard_id,
      standard_comment_en,
      standard_comment_fr,
      year: split_year(year),
      lower,
      met_count,
      count,
    })
  );

  const current_standard_report_rows = _.map(
    current_standard_rows,
    ({
      target_met: is_target_met,
      service_standard_id: standard_id,
      comments_en: standard_comment_en,
      comments_fr: standard_comment_fr,
      fiscal_yr: year,
      target: lower,
      volume_meeting_target: met_count,
      total_volume: count,
    }) => ({
      is_target_met: convert_to_bool_or_null(is_target_met, "Y", "N"),
      standard_id,
      standard_comment_en,
      standard_comment_fr,
      year: split_year(year),
      lower: lower * 100,
      met_count,
      count,
    })
  );

  const hist_service_standard_rows = _.map(
    raw_standard_rows,
    ({
      fiscal_yr: submission_year,
      service_std_id: standard_id,
      service_id,
      channel,
      service_std_type,
      service_std_en,
      service_std_fr,
      gcss_tool_fiscal_yr,
      standard_comment_en,
      standard_comment_fr,
    }) => ({
      standard_id,
      service_id,
      submission_year: split_year(submission_year),
      channel_en: key_to_text_def(channel_def_en, [channel]),
      channel_fr: key_to_text_def(channel_def_fr, [channel]),
      type_en: service_std_type,
      type_fr: key_to_text_def(service_std_type_fr, [service_std_type]),
      name_en: service_std_en,
      name_fr: service_std_fr,
      last_gcss_tool_year: gcss_tool_fiscal_yr,
      channel_code: channel,
      standard_type__code: service_std_type,
      standard_comment_en,
      standard_comment_fr,
      ...get_corresponding_urls(
        hist_standard_urls[service_id],
        split_year(submission_year),
        "standard_urls"
      ),
      standard_report: _.filter(
        hist_standard_report_rows,
        (standard_report) => standard_report.standard_id === standard_id
      ),
    })
  );

  const current_service_standard_rows = _.map(
    current_standard_rows,
    ({
      fiscal_yr: submission_year,
      service_standard_id: standard_id,
      service_id,
      channel,
      type: service_std_type,
      service_standard_en: service_std_en,
      service_standard_fr: service_std_fr,
      comments_en: standard_comment_en,
      comments_fr: standard_comment_fr,
    }) => ({
      standard_id,
      service_id,
      submission_year: split_year(submission_year),
      channel_en: key_to_text_def(channel_def_en, [channel]),
      channel_fr: key_to_text_def(channel_def_fr, [channel]),
      type_en: key_to_text_def(service_std_type_en, [service_std_type]),
      type_fr: key_to_text_def(service_std_type_fr, [service_std_type]),
      name_en: service_std_en,
      name_fr: service_std_fr,
      channel_code: channel,
      standard_type__code: service_std_type,
      standard_comment_en,
      standard_comment_fr,
      ...get_corresponding_urls(
        current_standard_urls,
        split_year(submission_year),
        "standard_urls"
      ),
      standard_report: _.filter(
        current_standard_report_rows,
        (standard_report) => standard_report.standard_id === standard_id
      ),
    })
  );

  const combine_service_standard_rows = _.concat(
    hist_service_standard_rows,
    current_service_standard_rows
  );

  const absolute_most_recent_submission_year = "2023";

  const unique_dept_names = _.chain(raw_service_rows)
    .map("department_name_en")
    .uniq()
    .sort()
    .value();

  const dept_id_by_dept_name = _.chain(org_variants_rows)
    .map(({ org_name_variant, org_id }) => [org_name_variant, org_id])
    .fromPairs()
    .value();

  const dept_code_by_dept_id = _.chain(igoc_rows)
    .map(({ org_id, dept_code }) => [org_id, dept_code])
    .fromPairs()
    .value();

  const dept_code_by_dept_name = _.chain(org_variants_rows)
    .map(({ org_name_variant, org_id }) => [
      org_name_variant,
      dept_code_by_dept_id[org_id],
    ])
    .fromPairs()
    .value();

  const hist_filtered_service_rows = _.chain(raw_service_rows)
    .map((service) => {
      const {
        fiscal_yr: submission_year,
        department_name_en: dept_name,
        service_id: id,
        service_fee: collects_fees,
        e_registration: account_reg_digital_status,
        e_authentication: authentication_status,
        e_application: application_digital_status,
        e_decision: decision_digital_status,
        e_issuance: issuance_digital_status,
        e_feedback: issue_res_digital_status,
        last_year_of_service_improvement_based_on_client_feedback:
          last_improve_from_feedback,
        last_GBA: last_gender_analysis,
        service_type,
        service_scope,
        client_target_groups,
        client_feedback,
        how_has_the_service_been_assessed_for_accessibility:
          accessibility_assessors,
        service_recipient_type,
        service_name_en: name_en,
        service_name_fr: name_fr,
        service_description_en: description_en,
        service_description_fr: description_fr,
        online_comments_en: digital_enablement_comment_en,
        online_comments_fr: digital_enablement_comment_fr,
      } = service;

      const service_report = _.filter(
        combine_service_report_rows,
        (service_report) => service_report.service_id === id
      );

      const standards = _.filter(
        combine_service_standard_rows,
        (service_standard_rows) => service_standard_rows.service_id === id
      );

      return {
        id,
        submission_year: split_year(submission_year),
        org_id: dept_id_by_dept_name[dept_name],
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
        program_activity_codes: _.chain(service_program_id_rows)
          .filter(
            (row) => row.fiscal_yr === submission_year && row.service_id === id
          )
          .flatMap(
            (row) => `${dept_code_by_dept_name[dept_name]}-${row.program_id}`
          )
          .value(),
        last_improve_from_feedback: split_year(last_improve_from_feedback),
        last_gender_analysis: split_year(last_gender_analysis),
        service_type_en: key_to_text_def(
          service_type_en,
          multi_value_string_fields_to_array(service_type)
        ),
        service_type_fr: key_to_text_def(
          service_type_fr,
          multi_value_string_fields_to_array(service_type)
        ),
        service_scope_en: key_to_text_def(
          scope_def_en,
          multi_value_string_fields_to_array(service_scope)
        ),
        service_scope_fr: key_to_text_def(
          scope_def_fr,
          multi_value_string_fields_to_array(service_scope)
        ),
        scope_codes: multi_value_string_fields_to_array(service_scope),
        target_groups_name_en: key_to_text_def(
          target_group_en,
          multi_value_string_fields_to_array(client_target_groups)
        ),
        target_groups_name_fr: key_to_text_def(
          target_group_fr,
          multi_value_string_fields_to_array(client_target_groups)
        ),
        feedback_channels_en: key_to_text_def(
          channel_def_en,
          multi_value_string_fields_to_array(client_feedback)
        ),
        feedback_channels_fr: key_to_text_def(
          channel_def_fr,
          multi_value_string_fields_to_array(client_feedback)
        ),
        accessibility_assessors_en: key_to_text_def(
          accessibility_assessors_en,
          multi_value_string_fields_to_array(accessibility_assessors)
        ),
        accessibility_assessors_fr: key_to_text_def(
          accessibility_assessors_fr,
          multi_value_string_fields_to_array(accessibility_assessors)
        ),
        recipient_type_en: key_to_text_def(
          service_recipient_type_en,
          multi_value_string_fields_to_array(service_recipient_type)
        ),
        recipient_type_fr: key_to_text_def(
          service_recipient_type_fr,
          multi_value_string_fields_to_array(service_recipient_type)
        ),
        name_en,
        name_fr,
        description_en,
        description_fr,
        digital_enablement_comment_en,
        digital_enablement_comment_fr,
        service_type_code: multi_value_string_fields_to_array(service_type),
        target_groups_id:
          multi_value_string_fields_to_array(client_target_groups),
        feedback_channels_code:
          multi_value_string_fields_to_array(client_feedback),
        accessibility_assessors_code: multi_value_string_fields_to_array(
          accessibility_assessors
        ),
        recipient_type_code: multi_value_string_fields_to_array(
          service_recipient_type
        ),
        ...get_corresponding_urls(
          hist_service_urls[id],
          split_year(submission_year),
          "urls"
        ),
        standards,
        service_report,
      };
    })
    .value();

  const current_filtered_service_rows = _.chain(current_raw_service_rows)
    .map((service) => {
      const {
        fiscal_yr: submission_year,
        owner_org_title: dept_name,
        service_id: id,
        service_fee: collects_fees,
        os_account_registration: account_reg_digital_status,
        os_authentication: authentication_status,
        os_application: application_digital_status,
        os_decision: decision_digital_status,
        os_issuance: issuance_digital_status,
        os_issue_resolution_feedback: issue_res_digital_status,
        last_service_improvement: last_improve_from_feedback,
        service_type,
        service_scope,
        client_target_groups,
        client_feedback_channel: client_feedback,
        service_recipient_type,
        service_name_en: name_en,
        service_name_fr: name_fr,
        service_description_en: description_en,
        service_description_fr: description_fr,
        os_comments_client_interaction_en: digital_enablement_comment_en,
        os_comments_client_interaction_fr: digital_enablement_comment_fr,
        program_id: program_activity_codes,
      } = service;

      const service_report = _.filter(
        combine_service_report_rows,
        (service_report) => service_report.service_id === id
      );

      const standards = _.filter(
        combine_service_standard_rows,
        (service_standard_rows) => service_standard_rows.service_id === id
      );

      return {
        id,
        submission_year: split_year(submission_year),
        org_id:
          dept_id_by_dept_name[
            multi_value_string_fields_to_array(dept_name, " | ")[0]
          ],
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
        program_activity_codes: _.map(
          multi_value_string_fields_to_array(program_activity_codes, ","),
          (program) =>
            `${
              dept_code_by_dept_name[
                multi_value_string_fields_to_array(dept_name, " | ")[0]
              ]
            }-${program}`
        ),
        last_improve_from_feedback: split_year(last_improve_from_feedback),
        last_gender_analysis: null,
        service_type_en: key_to_text_def(
          service_type_en,
          multi_value_string_fields_to_array(service_type, ",")
        ),
        service_type_fr: key_to_text_def(
          service_type_fr,
          multi_value_string_fields_to_array(service_type, ",")
        ),
        service_scope_en: key_to_text_def(
          scope_def_en,
          multi_value_string_fields_to_array(service_scope, ",")
        ),
        service_scope_fr: key_to_text_def(
          scope_def_fr,
          multi_value_string_fields_to_array(service_scope, ",")
        ),
        scope_codes: multi_value_string_fields_to_array(service_scope, ","),
        target_groups_name_en: key_to_text_def(
          target_group_en,
          multi_value_string_fields_to_array(client_target_groups, ",")
        ),
        target_groups_name_fr: key_to_text_def(
          target_group_fr,
          multi_value_string_fields_to_array(client_target_groups, ",")
        ),
        feedback_channels_en: key_to_text_def(
          channel_def_en,
          multi_value_string_fields_to_array(client_feedback, ",")
        ),
        feedback_channels_fr: key_to_text_def(
          channel_def_fr,
          multi_value_string_fields_to_array(client_feedback, ",")
        ),
        accessibility_assessors_en: null,
        accessibility_assessors_fr: null,
        recipient_type_en: key_to_text_def(
          service_recipient_type_en,
          multi_value_string_fields_to_array(service_recipient_type, ",")
        ),
        recipient_type_fr: key_to_text_def(
          service_recipient_type_fr,
          multi_value_string_fields_to_array(service_recipient_type, ",")
        ),
        name_en,
        name_fr,
        description_en,
        description_fr,
        digital_enablement_comment_en,
        digital_enablement_comment_fr,
        service_type_code: multi_value_string_fields_to_array(
          service_type,
          ","
        ),
        target_group_id: multi_value_string_fields_to_array(
          client_target_groups,
          ","
        ),
        feedback_channels_code: multi_value_string_fields_to_array(
          client_feedback,
          ","
        ),
        accessibility_assessors_code: null,
        recipient_type_code: multi_value_string_fields_to_array(
          service_recipient_type,
          ","
        ),
        ...get_corresponding_urls(
          current_service_urls[id],
          split_year(submission_year),
          "urls"
        ),
        standards,
        service_report,
      };
    })
    .value();

  const filtered_service_rows = _.chain(hist_filtered_service_rows)
    .concat(current_filtered_service_rows)
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

  const get_incomplete_services = (services) =>
    _.chain(services)
      .filter(
        (service) =>
          _.difference(service.program_activity_codes, program_ids).length != 0
      )
      .map(
        ({
          id,
          name_en,
          name_fr,
          submission_year,
          org_id,
          program_activity_codes,
        }) => ({
          id,
          name_en,
          name_fr,
          submission_year,
          dept_code: dept_code_by_dept_id[org_id],
          program_activity_codes,
        })
      )
      .value();

  const get_incomplete_dept = (services) =>
    _.chain(services)
      .map(({ org_id, program_activity_codes }) =>
        _.difference(program_activity_codes, program_ids).length != 0
          ? org_id
          : null
      )
      .compact()
      .uniq()
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
      incomplete_dept: get_incomplete_dept(
        absolute_most_recent_year_filtered_services
      ),
      incomplete_services: get_incomplete_services(
        absolute_most_recent_year_filtered_services
      ),
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
        num_of_subject_offering_services: _.chain(unique_dept_names)
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
        incomplete_dept: get_incomplete_dept(filtered_services),
        incomplete_services: get_incomplete_services(filtered_services),
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
