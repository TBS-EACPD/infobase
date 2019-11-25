const all_services_And_standards_for_org = `
query{
  root(lang: "en"){
    org(org_id: "326"){
      services {
        service_id,
        org_id,
        year,
        is_active,

        name,
        description,
        service_type,
        scope,
        
        last_gender_analysis,
        
        collects_fees,

        account_reg_digital_status,
        authentication_status,
        application_digital_status,
        decision_digital_status,
        issuance_digital_status,
        issue_res_digital_status,
        digital_enablement_comment,

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
    }
  }
}`;


const { execQuery } = global;

describe("services data", function(){
  
  it("All services and standards for org", async ()=> {
    const data = await execQuery(all_services_And_standards_for_org, {});
    return expect(data).toMatchSnapshot();
  });

});