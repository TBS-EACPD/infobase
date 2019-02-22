const query = `
query entire_4_orgs{
  
	root(lang:"en"){
    tbs: org(org_id:"326"){
      ...everything
    }
    dnd: org(org_id:"133"){
      ...everything
    }
    polar: org(org_id:"552"){
      ...everything
    }
    bank: org(org_id:"15"){
      ...everything
    }
  }
  
}
fragment everything on Org {
  crsos {
    id
    programs {
			id
      results(doc: "drr17") {
        id
        indicators {
          id
        }
      }
    }
    results(doc: "dp18") {
      indicators {
        id
      }
    }
  }
}
`

const { execQuery } = global;

describe("results data", function(){

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



// query ($org_id:String) {
// 	root(lang:"en"){
//   	org(org_id: $org_id){
//       target_counts(doc: "drr17"){
//         ...counts
//       }
//     	crsos {
//         target_counts(doc: "drr17"){
//         	...counts
//       	}
//       	id
//         results {
//           ...result_fields
//         }
//         programs {
//           target_counts(doc: "drr17"){
//         		...counts
//       		}
//           id
//           results {
//             ...result_fields
// 	        }
//   	      sub_programs {
//     	      ...subprog_fields
// 						sub_programs {
//             	...subprog_fields
//             }
//           }
//         }
//       }
//     }
//   }
// }	


// fragment result_fields on Result {
//   name
//   indicators {
//     name
//   }	
// }

// fragment subprog_fields on SubProgram {
//   id
//   results {
//     ...result_fields
//   }
// }

// fragment counts on ResultCount {
//   results
//   dp
//   met
//   not_met
//   future
//   not_available
// }