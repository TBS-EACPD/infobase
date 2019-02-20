const query = `
query ($org_id:String) {
	root(lang:"en"){
  	org(org_id: $org_id){
      target_counts(doc: "drr17"){
        ...counts
      }
    	crsos {
        target_counts(doc: "drr17"){
        	...counts
      	}
      	id
        results {
          ...result_fields
        }
        programs {
          target_counts(doc: "drr17"){
        		...counts
      		}
          id
          results {
            ...result_fields
	        }
  	      sub_programs {
    	      ...subprog_fields
						sub_programs {
            	...subprog_fields
            }
          }
        }
      }
    }
  }
}	


fragment result_fields on Result {
  name
  indicators {
    name
  }	
}

fragment subprog_fields on SubProgram {
  id
  results {
    ...result_fields
  }
}

fragment counts on ResultCount {
  results
  dp
  met
  not_met
  future
  not_available
}
`

const { execQuery } = global;

describe("results data", function(){

  it("AGR drr snapshot", async ()=> {
    const variables = {
      org_id: "1",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
  
  it("AGR dp snapshot", async ()=> {
    const variables = {
      org_id: "1",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
  
  it("TBS drr snapshot", async ()=> {
    const variables = {
      org_id: "326",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
  
  it("TBS dp snapshot", async ()=> {
    const variables = {
      org_id: "326",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });
})