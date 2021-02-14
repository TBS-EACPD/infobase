const { execQuery } = global;

const all_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    covid_measures {
      id
      name
      in_estimates
      covid_funding {
        fiscal_year
        funding
      }

      has_covid_data {
        has_estimates
        has_expenditures
        has_commitments
      }

      covid_estimates {
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
      covid_expenditures {
        org_id
        org {
          id
          name
        }
    
        fiscal_year
        is_budgetary
        vote
        stat
      }
      covid_commitments {
        org_id
        org {
          id
          name
        }
    
        fiscal_year
        commitment
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
      in_estimates
      covid_funding {
        fiscal_year
        funding
      }

      has_covid_data {
        has_estimates
        has_expenditures
        has_commitments
      }
    }
  }
}`;

const gov_covid_summary_query = `
query ($lang: String = "en", $top_x: Int = 1) {
  root(lang: $lang) {
    gov {
      covid_summary {
        covid_funding {
          fiscal_year
          funding
        }

        top_spending_orgs {
          org_id
          name
        }
        top_spending_measures(top_x: $top_x) {
          id
          name
        }

        covid_estimates {
          fiscal_year
          est_doc
          vote
          stat
        }
        covid_expenditures {
          fiscal_year
          is_budgetary
          vote
          stat
        }
        covid_commitments {
          fiscal_year
          commitment
        }
      }
    }
  }
}`;

const org_covid_summary_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id: "133") {
      org_id
      name

      covid_summary {
        covid_estimates {
          fiscal_year
          est_doc
          vote
          stat
        }
        covid_expenditures {
          fiscal_year
          is_budgetary
          vote
          stat
        }
        covid_commitments {
          fiscal_year
          commitment
        }
      }
    }
  }
}`;

const org_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    org(org_id: "133") {
      covid_measures {
        id
        name
        in_estimates
        covid_funding {
          fiscal_year
          funding
        }

        has_covid_data {
          has_estimates
          has_expenditures
          has_commitments
        }

        covid_estimates {
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
        covid_expenditures {
          org_id
          org {
            id
            name
          }
      
          fiscal_year
          is_budgetary
          vote
          stat
        }
        covid_commitments {
          org_id
          org {
            id
            name
          }
      
          fiscal_year
          commitment
        }
      }
    }
  }
}`;

const org_has_covid_data_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    has_data: org(org_id: "133") {
      has_covid_data {
        has_estimates
        has_expenditures
        has_commitments
      }
    }
    does_not_have_data: org(org_id: "15") {
      has_covid_data {
        has_estimates
        has_expenditures
        has_commitments
      }
    }
    only_has_estimates: org(org_id: "1") {
      has_covid_data {
        has_estimates
        has_expenditures
        has_commitments
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
    const data = await execQuery(gov_covid_summary_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org covid estimates summary", async () => {
    const data = await execQuery(org_covid_summary_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org covid measures", async () => {
    const data = await execQuery(org_covid_measures_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org has covid data", async () => {
    const data = await execQuery(org_has_covid_data_query, {});
    return expect(data).toMatchSnapshot();
  });
});
