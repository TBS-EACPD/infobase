const query = `
query ($dept_code: String, $doc:String){
  root(lang: "en"){
    org(dept_code: $dept_code){
      programs {
        ...result_info
        drs {
          name
        }
        sub_programs {
          ...result_info
          sub_programs {
            ...result_info
          }
        }
      }
    }
  }
}

fragment result_info on RppEntity {
name
id
results(doc: $doc) {
  id
  name
  is_efficiency
  indicators(doc: $doc) {
    id
    name
    
    target_year
    target_month
    
    target_narrative
    target_type
    target_min
    target_max

    
    actual_datatype
    actual_result
    status_key
    explanation
    
    status_color
    status_period
    status_key
    
    explanation
    
    
  }
}
}
`

const { execQuery } = global;

describe("results data", function(){

  it("AGR drr snapshot", async ()=> {
    const variables = {
      dept_code: "AGR",
      doc: "drr16",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });

  it("AGR dp snapshot", async ()=> {
    const variables = {
      "dept_code": "AGR",
      "doc": "dp17",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });

  it("TBS drr snapshot", async ()=> {
    const variables = {
      "dept_code": "TBC",
      "doc": "drr16",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
  
  it("TBS dp snapshot", async ()=> {
    const variables = {
      "dept_code": "TBC",
      "doc": "dp17",  
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
})