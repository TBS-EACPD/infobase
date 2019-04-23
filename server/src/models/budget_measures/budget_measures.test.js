const budget_measure_fields = `
measure_id
name
chapter_key
section_id
description
`;

const gov_budget_measure_query = `
query{
  root(lang: "en") {
    gov {
      fake_budget_orgs {
        org_id
        level
        name
      }
      measures_2018: all_budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: all_budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;


const { execQuery } = global;

describe("Budget measure data", function(){
  
  it("budget measure snapshots: gov", async ()=> {
    const data = await execQuery(gov_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });
  
});