const { execQuery } = global;

const org_vote_stat_pa_field = `
org_vote_stat_pa{
  vote_num
  vs_type
  name

  pa_last_year_5_auth
  pa_last_year_4_auth
  pa_last_year_3_auth
  pa_last_year_2_auth
  pa_last_year_auth

  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_exp

  pa_last_year_5_unlapsed
  pa_last_year_4_unlapsed
  pa_last_year_3_unlapsed
  pa_last_year_2_unlapsed
  pa_last_year_unlapsed
}`;
const org_vote_stat_estimates_field = `
org_vote_stat_estimates{
  vote_num
  vs_type
  name
  doc

  est_last_year_4
  est_last_year_3
  est_last_year_2
  est_last_year
  est_in_year
}`;
const org_transfer_payments_field = `
org_transfer_payments{
  type
  name

  pa_last_year_5_auth
  pa_last_year_4_auth
  pa_last_year_3_auth
  pa_last_year_2_auth
  pa_last_year_1_auth

  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_1_exp
}`;
const program_sobjs_field = `
program_sobjs{
  so_num
  pa_last_year_3
  pa_last_year_2
  pa_last_year
}`;
const program_vote_stat_field = `
program_vote_stat{
  vs_type
  pa_last_year_3
  pa_last_year_2
  pa_last_year
}`;
const program_spending_field = `
program_spending{
  pa_last_year_5_exp
  pa_last_year_4_exp
  pa_last_year_3_exp
  pa_last_year_2_exp
  pa_last_year_exp

  planning_year_1
  planning_year_1_rev
  planning_year_1_spa
  planning_year_1_gross

  planning_year_2
  planning_year_2_rev
  planning_year_2_spa
  planning_year_2_gross

  planning_year_3
  planning_year_3_rev
  planning_year_3_spa
  planning_year_3_gross
}`;
const program_fte_field = `
program_fte{
  pa_last_year_5
  pa_last_year_4
  pa_last_year_3
  pa_last_year_2
  pa_last_year
  pa_last_year_planned
  planning_year_1
  planning_year_2
  planning_year_3
}`;

const org_vote_stat_pa_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(dept_code: "CPCC") {
      ${org_vote_stat_pa_field}
    }
  }
}`;
const org_vote_stat_estimates_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(dept_code: "CPCC") {
      ${org_vote_stat_estimates_field}
    }
  }
}`;
const org_transfer_payments_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(dept_code: "CPCC") {
      ${org_transfer_payments_field}
    }
  }
}`;
const program_sobjs_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "CPCC-ISC00") {
      ${program_sobjs_field}
    }
  }
}`;
const program_vote_stat_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "CPCC-ISC00") {
      ${program_vote_stat_field}
    }
  }
}`;
const program_spending_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "CPCC-ISC00") {
      ${program_spending_field}
    }
  }
}`;
const program_fte_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "ND-ISC00") {
      ${program_fte_field}
    }
  }
}`;

describe("finance data", () => {
  it("org vote stat pa snapshot", async () => {
    const data = await execQuery(org_vote_stat_pa_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("org vote stat estimates snapshot", async () => {
    const data = await execQuery(org_vote_stat_estimates_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("org transfer payments snapshot", async () => {
    const data = await execQuery(org_transfer_payments_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("program sobjs snapshot", async () => {
    const data = await execQuery(program_sobjs_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("program vote stat snapshot", async () => {
    const data = await execQuery(program_vote_stat_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("program spending snapshot", async () => {
    const data = await execQuery(program_spending_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("program fte snapshot", async () => {
    const data = await execQuery(program_fte_query, {});
    return expect(data).toMatchSnapshot();
  });
});
