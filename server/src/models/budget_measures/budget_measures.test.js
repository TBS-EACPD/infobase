const make_budget_measure_query = (scope_fragment) => `
query{
  root(lang: "en") {
    ${scope_fragment} {
      id
      measure_id
      chapter_key
      budget_link
      funded_org_ids
      funded_orgs {
        ... on Org {
          id
        }
        ... on SpecialFundingCase {
          id
          org_id
          level
          name
          desc
          budget_funds_data {
            org_id
          }
        }
      }
      budget_funds_data {
        org_id
      }
    }
  }
}`;

const budget_measure_all_query = make_budget_measure_query(`all_budget_measures`);
const budget_measure_by_id_query = make_budget_measure_query(`budget_measure(measure_id: "1")`);


const make_budget_funds_query = (scope_fragment) => `
query{
  root(lang: "en") {
    ${scope_fragment} {
      budget_funds_data {
        measure_id
        budget_measure {
          measure_id
        }
        org_id
        org {
          ... on Org {
            id
          }
          ... on SpecialFundingCase {
            id
          }
        }
        budget_funding
        budget_allocated
        budget_withheld
        budget_remaining
      }
    }
  }
}`;

const budget_funds_all_query = make_budget_funds_query(`gov`);
const budget_funds_org_query = make_budget_funds_query(`org(dept_code: "TBC")`);
const budget_funds_measure_query = make_budget_funds_query(`budget_measure(measure_id: "1")`);

const { execQuery } = global;

describe("Budget measure data", function(){
  
  it("budget measure snapshots: all", async ()=> {
    const data = await execQuery(budget_measure_all_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshots: by measure id", async ()=> {
    const data = await execQuery(budget_measure_by_id_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget funds snapshots: gov (all)", async ()=> {
    const data = await execQuery(budget_funds_all_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget funds snapshots: org", async ()=> {
    const data = await execQuery(budget_funds_org_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget funds snapshots: measure", async ()=> {
    const data = await execQuery(budget_funds_measure_query, {});
    return expect(data).toMatchSnapshot();
  });
  
});