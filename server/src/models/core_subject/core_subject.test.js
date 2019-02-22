const _ = require("lodash");


const crso_query  = `
query CRSOTestQuery ($lang: String!){
  root(lang: $lang){
    org(org_id:"133"){
      acronym
      crsos {
        id
      }
    }
    crso(id:"ND-SO00227"){
      name
      programs {
        id
      }
      org {
        id
      }
    }
    program(id:"ND-SO00224"){
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
    
    org(org_id:"133"){
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
    org_with_notes: org(org_id: "326"){
      notes
    }
    org_with_auditor: org(org_id: "15"){
      auditor
    }
    org_with_end_date: org(org_id:"326"){
      end_yr
    }
    org_with_faa_hr: org(org_id:"552"){
      faa_schedule_hr_status
    }
    org_with_fed_ownership: org(org_id: "326"){
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
    program(id: "ND-ATT00"){
      id
      activity_code
      is_internal_service
      description
      
    }
    internal_service_program: program(id:"TBC-BXD01"){
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
