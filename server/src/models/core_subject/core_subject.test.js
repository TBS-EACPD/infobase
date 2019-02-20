const _ = require("lodash");


const crso_query  = `
query CRSOTestQuery ($lang: String!){
  root(lang: $lang){
    org(org_id:"128"){
      acronym
      crsos {
        id
      }
    }
    crso(id:"HRSD-SO0491"){
      name
      programs {
        id
      }
      org {
        id
      }
    }
    program(id:"HRSD-AMQ00"){
      crso {
        id
      }
    }
  }
}
`;


const { execQuery } = global;

describe("subject linkage", function(){

  it("crso root, up and down linkage", async ()=> {
    const data = await execQuery(crso_query, {});
    return expect(data).toMatchSnapshot();
  });

})

const org_fields_query = `
query IgocTestQuery ($lang: String!){
  root(lang: $lang){
    
    org(org_id:"128"){
      inst_form {
        id
      }
      article_1
      article_2
      enabling_instrument
      auditor
      notes
      faa_schedule_institutional
      incorp_yr
      
      
      ministry {
        name
        id
        orgs {
          id
        }
      }
      ministers {
        id
        name
      }
    }
    org_with_notes: org(org_id: "10"){
      notes
    }
    org_with_auditor: org(org_id: "97"){
      auditor
    }
    org_with_end_date: org(org_id:"291"){
      end_yr
    }
    org_with_faa_hr: org(org_id:"296"){
      faa_schedule_hr_status
    }
    org_with_fed_ownership: org(org_id: "285"){
      fed_ownership
    }
  }
}
`

describe("igoc linkage and fields", function(){

  it("igoc linkage and fields", async ()=> {
    const data = await execQuery(org_fields_query, {});
    return expect(data).toMatchSnapshot();
  });

});

const program_query = `
query ProgramTestQuery ($lang: String!){
  root(lang: $lang){
    program(id: "AGR-AAA00"){
      id
      activity_code
      is_internal_service
      description
      
    }
    internal_service_program: program(id:"AGR-ISC00"){
      is_internal_service
    }
    inactive_program: program(id: "TBC-DAC00"){
      is_active
    }
    
  }
}
`;

describe("program basic fields", function(){

  it("program basic fields", async ()=> {
    const data = await execQuery(program_query, {});
    return expect(data).toMatchSnapshot();
  });

});
