const { execQuery } = global;

const all_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    covid_measures {
      id
      name

      covid_estimates {
        id
    
        org_id
        org {
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

const specific_covid_measures_query = `
query ($lang: String = "en", $covid_measure_id: String = "COV001") {
  root(lang: $lang) {
    covid_measure(covid_measure_id: $covid_measure_id) {
      id
      name
    }
  }
}`;

const gov_covid_estimates_summary_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    gov {
      covid_estimates_summary {
        id

        fiscal_year
        est_doc
        vote
        stat
      }
    }
  }
}`;

const org_covid_estimates_summary_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id:"133") {
      covid_estimates_summary {
        id

        fiscal_year
        est_doc
        vote
        stat
      }
    }
  }
}`;

const org_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id:"133") {
      covid_measures {
        id
        name

        covid_estimates {
          id
      
          org_id
          org {
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
  it("Specific covid measure", async () => {
    const data = await execQuery(specific_covid_measures_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Gov covid estimates summary", async () => {
    const data = await execQuery(gov_covid_estimates_summary_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org covid estimates summary", async () => {
    const data = await execQuery(org_covid_estimates_summary_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org covid measures", async () => {
    const data = await execQuery(org_covid_measures_query, {});
    return expect(data).toMatchSnapshot();
  });
});
