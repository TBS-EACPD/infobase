const budget_measure_fields = `
measure_id
name
chapter_key
section_id
description
data {
  unique_id
  org_id
  measure_id
  description
  funding
  allocated
  remaining
  withheld
  program_allocations {
    unique_id
    subject_id
    measure_id
    allocated
  }
  submeasure_breakouts {
    unique_id
    submeasure_id
    name
    org_id
    parent_measure_id
    allocated
    withheld
    program_allocations {
      unique_id
      subject_id
      measure_id
      allocated
    }
  }
}
`;


const direct_budget_measure_query = `
query{
  root(lang: "en") {
    measure_case: budget_measure(year: 2018, measure_id: "34"){
      ${budget_measure_fields}
    }
    submeasure_case: budget_measure(year: 2018, measure_id: "326"){
      ${budget_measure_fields}
    }
  }
}`;

const gov_budget_measure_query = `
query{
  root(lang: "en") {
    gov {
      measures_2018: budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;

const fake_org_budget_measure_query = `
query{
  root(lang: "en") {
    fake_budget_orgs {
      org_id
      level
      name
      measures_2018: budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;

const org_budget_measure_query = `
query{
  root(lang: "en") {
    org(org_id: "326") {
      measures_2018: budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;

const crso_budget_measure_query = `
query{
  root(lang: "en") {
    crso(id: "TBC-ISS00") {
      measures_2018: budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;


const program_budget_measure_query = `
query{
  root(lang: "en") {
    program(id: "TBC-BXA02") {
      measures_2018: budget_measures(year: 2018) {
        ${budget_measure_fields}
      }
      measures_2019: budget_measures(year: 2019) {
        ${budget_measure_fields}
      }
    }
  }
}`;


const { execQuery } = global;

describe("Budget measure data", function(){
  
  it("budget measure snapshot: direct measure query", async ()=> {
    const data = await execQuery(direct_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshot: gov", async ()=> {
    const data = await execQuery(gov_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshot: org", async ()=> {
    const data = await execQuery(org_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshot: fake org", async ()=> {
    const data = await execQuery(fake_org_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshot: crso", async ()=> {
    const data = await execQuery(crso_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("budget measure snapshot: program", async ()=> {
    const data = await execQuery(program_budget_measure_query, {});
    return expect(data).toMatchSnapshot();
  });
  
});