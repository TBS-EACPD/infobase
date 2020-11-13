const { execQuery } = global;

const covid_initiative_estimates_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id: "133") {
      covid_initiative_estimates {
        org_id

        covid_initiative_id
        covid_initiative {
          id
          name
        }

        covid_measure_ids
        covid_measures {
          id
          name
        }
        
        fiscal_year
        est_doc
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
