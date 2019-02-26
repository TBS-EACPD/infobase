const { execQuery } = global;

const dept_results_data_query = `
query entire_4_orgs {
	root(lang:"en") {
    tbs: org(org_id:"326") {
      ...everything
    }
    dnd: org(org_id:"133") {
      ...everything
    }
    polar: org(org_id:"552") {
      ...everything
    }
    bank: org(org_id:"15") {
      ...everything
    }
  }
}

fragment result_and_indicator_fields on Result {
  id
  parent_id
  name
  doc

  indicators {
    result_id
    name
    
    target_year
    target_month
    target_type
    target_min
    target_max
    target_narrative
    doc
    
    explanation
    
    actual_result
    actual_datatype
    actual_result
    
    status_key
    
    methodology
    measure
  }
}
fragment everything on Org {
  crsos {
    id
    programs {
			id
      results(doc: "drr17") {
        ...result_and_indicator_fields
      }
    }
    results(doc: "dp18") {
      ...result_and_indicator_fields
    }
  }
}
`;
describe("results data", function(){

  it("Test departments result snapshot", async ()=> {
    const data = await execQuery(dept_results_data_query);
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