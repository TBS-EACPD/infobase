const { execQuery } = global;

const all_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    covid_measures {
      id
      name
    }
  }
}`;

const all_covid_initiatives_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    covid_initiatives {
      id
      name

      estimates {
        org_id

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

const org_covid_initiatives_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id: "133") {
      covid_initiatives {
        id
        name

        estimates {
          org_id

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
  }
}`;

describe("covid data", () => {
  it("All covid measures", async () => {
    const data = await execQuery(all_covid_measures_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("All covid initiatives and estimates", async () => {
    const data = await execQuery(all_covid_initiatives_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Query org's covid initiatives and estimates", async () => {
    const data = await execQuery(org_covid_initiatives_query, {});
    return expect(data).toMatchSnapshot();
  });
});
