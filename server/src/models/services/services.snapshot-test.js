const service_fields = `
  id
  subject_type
  org_id
  org {
    name
  }
  submission_year
  is_active
  report_years
  program_activity_codes
  programs {
    name
  }

  first_active_year
  last_active_year

  name
  description
  service_type
  scope
  designations
  target_groups
  feedback_channels
  urls
  digital_identity_platforms
  accessibility_assessors
  recipient_type

  last_gender_analysis
  last_accessibility_review
  last_improve_from_feedback

  collects_fees
  account_reg_digital_status
  authentication_status
  application_digital_status
  decision_digital_status
  issuance_digital_status
  issue_res_digital_status
  digital_enablement_comment

  service_report {
    service_id
    year
    cra_business_ids_collected
    sin_collected
    phone_inquiry_count
    online_inquiry_count
    online_application_count
    live_application_count
    mail_application_count
    phone_application_count
    other_application_count
    email_application_count
    fax_application_count
    phone_inquiry_and_application_count
    service_report_comment
  }

  standards {
    standard_id
    service_id
    name
    submission_year
    first_active_year
    last_active_year
    last_gcss_tool_year
    channel
    type
    other_type_comment

    target_type

    standard_urls
    rtp_urls

    standard_report {
      standard_id
      year
      lower
      upper
      count
      met_count
      is_target_met
      standard_report_comment  
    }
  }
`;

const summary_fields = `
service_summary{
  id
  service_general_stats {
    report_years
    number_of_services
    number_of_online_enabled_services
    num_of_subject_offering_services
    num_of_programs_offering_services
  }
  service_channels_summary {
    subject_id
    year
    channel_id
    channel_value
  }
  service_digital_status_summary{
    key
    key_desc
    subject_id
    can_online
    cannot_online
    not_applicable
  }
  service_standards_summary{
    subject_id
    services_w_standards_count
    standards_count
    met_standards_count
  }
  subject_offering_services_summary{
    subject_id
    number_of_services
    total_volume
  }
}
`;

const all_services_and_standards_for_org = `
query{
  root(lang: "en"){
    org(org_id: "114"){
      services{
        ${service_fields}
      }
    }
  }
}`;

const all_services_and_standards_for_program = `
query{
  root(lang: "en"){
    program(id: "CB-BEZ01"){
      services{
        ${service_fields}
      }
    }
  }
}`;

const all_summary_for_org = `
query{
  root(lang: "en"){
    org(org_id: "114"){
      ${summary_fields}
    }
  }
}`;

const all_summary_for_program = `
query{
  root(lang: "en"){
    program(id: "CB-BEZ01"){
      ${summary_fields}
    }
  }
}`;

const single_service = `
query{
  root(lang: "en"){
    service(id: "1120"){
      ${service_fields}
    }
  }
}`;

const search_services_en = `
query{
  en_root: root(lang: "en"){
    search_by_french_word: search_services(search_phrase: "Établissement"){
      id,
      name
    }
    search_by_english_word: search_services(search_phrase: "Copyright"){
      id,
      name
    }
  }
}`;
const search_services_fr = `
query{
  fr_root: root(lang: "fr"){
    diacritical_search: search_services(search_phrase: "Établissement"){
      id,
      name
    }
    diacritical_free_search: search_services(search_phrase: "Etablissement"){
      id,
      name
    }
    multi_word_search: search_services(search_phrase: "tarifs droit"){
      id,
      name
    }
    partial_word_search: search_services(search_phrase: "es"){
      id,
      name
    }
  }
}`;

const { execQuery } = global;

describe("services data", function () {
  it("All services and standards for org", async () => {
    const data = await execQuery(all_services_and_standards_for_org, {});
    return expect(data).toMatchSnapshot();
  });
  it("All services and standards for program", async () => {
    const data = await execQuery(all_services_and_standards_for_program, {});
    return expect(data).toMatchSnapshot();
  });
  it("All service summary for org", async () => {
    const data = await execQuery(all_summary_for_org, {});
    return expect(data).toMatchSnapshot();
  });
  it("All service summary for program", async () => {
    const data = await execQuery(all_summary_for_program, {});
    return expect(data).toMatchSnapshot();
  });
  it("Single service", async () => {
    const data = await execQuery(single_service, {});
    return expect(data).toMatchSnapshot();
  });
  it("Searching services by name", async () => {
    const data_en = await execQuery(search_services_en, {});
    const data_fr = await execQuery(search_services_fr, {});
    return expect([data_en, data_fr]).toMatchSnapshot();
  });
});
