const { execQuery } = global;

const covid_initiative_estimates_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(dept_code: "TBS") {
      covid_initiative_estimates {
        covid_initiative_id
        covid_initiative {
          name
        }
        
        fiscal_year
        vote
        stat
      }
    }
  }
}`;

describe("covid data", () => {
  it("covid initiative estimates", async () => {
    const data = await execQuery(covid_initiative_estimates_query, {});
    return expect(data).toMatchSnapshot();
  });
});
