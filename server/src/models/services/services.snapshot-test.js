const service_fields = `
  id
  org_id
  org {
    name
  }
  program_ids
  programs {
    name
  }

  first_active_year
  last_active_year
  is_active

  name
  description
  service_type
  scope
  target_groups
  feedback_channels
  urls

  last_gender_analysis

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
    other_application_count
    service_report_comment
  }

  standards {
    standard_id,
    service_id,

    name
    last_gcss_tool_year
    channel
    type
    other_type_comment

    target_type

    urls
    rtp_urls

    standard_report {
      standard_id,
      year
      lower
      count
      met_count
      is_target_met
      standard_report_comment  
    }
  },
`;

const summary_fields = `
service_summary{
  id
  service_general_stats {
    id
    number_of_services
  }
  service_type_summary{
    id
    subject_id
    label
    value
  }
  service_digital_status_summary{
    id
    key
    key_desc
    subject_id
    can_online
    cannot_online
    not_applicable
  }
  service_id_methods_summary{
    id
    method
    subject_id
    label
    value
  }
  service_standards_summary{
    id
    subject_id
    services_w_standards_count
    standards_count
    met_standards_count
  }
  service_fees_summary{
    id
    subject_id
    label
    value
  }
  top_services_application_vol_summary{
    id
    service_id
    subject_id
    name
    value
  }
  service_high_volume_summary{
    id
    subject_id
    total_volume
  }
  top_services_website_visits_summary{
    id
    subject_id
    service_id
    service_name
    website_visits_count
  }

}
`;

const all_services_and_standards_for_org = `
query{
  root(lang: "en"){
    org(org_id: "326"){
      services{
        ${service_fields}
      }
    }
  }
}`;

const all_services_and_standards_for_program = `
query{
  root(lang: "en"){
    program(id: "TBC-BXB01"){
      services{
        ${service_fields}
      }
    }
  }
}`;

const all_summary_for_org = `
query{
  root(lang: "en"){
    org(org_id: "326"){
      ${summary_fields}
    }
  }
}`;

const all_summary_for_program = `
query{
  root(lang: "en"){
    program(id: "TBC-BXB01"){
      ${summary_fields}
    }
  }
}`;

const single_service = `
query{
  root(lang: "en"){
    service(id: "1114"){
      ${service_fields}
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
});
