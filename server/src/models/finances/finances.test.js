const { execQuery } = global;

const program_spending_field = `
program_spending{
  program_id

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
  program_id
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

const program_spending_query =`
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "ACOA-ABH00") {
      ${program_spending_field}
    }
  }
}`;

const program_fte_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    program(id: "ACOA-ABH00") {
      ${program_fte_field}
    }
  }
}`;


describe('finance data', () => {
  it("program spending snapshot", async () => {
    const data = await execQuery(program_spending_query, {});
    return expect(data).toMatchSnapshot();
  });

  it("program fte snapshot", async () => {
    const data = await execQuery(program_fte_query, {});
    return expect(data).toMatchSnapshot();
  });
});