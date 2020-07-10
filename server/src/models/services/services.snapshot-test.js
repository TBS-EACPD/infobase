const services_fields = `
services {
  service_id
  org_id
  org {
    name
  }
  program_ids
  programs {
    name
  }

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
    SIN_collected
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
      standard_report_comment  
    }
  },
}
`;

const all_services_and_standards_for_org = `
query{
  root(lang: "en"){
    org(org_id: "326"){
      ${services_fields}
    }
  }
}`;

const all_services_and_standards_for_program = `
query{
  root(lang: "en"){
    program(id: "TBC-BXB01"){
      ${services_fields}
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
});
