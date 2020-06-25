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
  year
  is_active

  name
  description
  service_type
  scope
  target_groups
  feedback_channels
  url
  comment

  last_gender_analysis

  collects_fees
  cra_buisnss_number_is_identifier
  sin_is_identifier
  account_reg_digital_status
  authentication_status
  application_digital_status
  decision_digital_status
  issuance_digital_status
  issue_res_digital_status
  digital_enablement_comment

  telephone_enquires
  website_visits
  online_applications
  in_person_applications
  mail_applications
  other_channel_applications

  standards {
    standard_id,
    service_id,
    is_active,

    name,
    last_gcss_tool_year,
    channel,
    standard_type,
    other_type_comment,

    target_type,
    lower,
    upper,
    count,
    met_count,
    is_target_met,

    target_comment,

    urls,
    rtp_urls,
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
    program(id: "TBC-BXA01"){
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
