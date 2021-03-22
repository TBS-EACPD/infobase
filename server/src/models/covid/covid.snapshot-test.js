const { execQuery } = global;

const estimates_fields = `
  est_doc
  vote
  stat
`;
const expenditures_fields = `
  vote
  stat
`;
const measure_covid_data = `
  fiscal_year

  covid_estimates {
    org_id
    org {
      id
      name
    }
  
    ${estimates_fields}
  }
  covid_expenditures {
    org_id
    org {
      id
      name
    }
  
    ${expenditures_fields}
  }
`;
const years_with_covid_data = `
  years_with_covid_data {
    years_with_estimates
    years_with_expenditures
  }
`;

const all_covid_measures_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    covid_measures {
      id
      name

      ${years_with_covid_data}

      all_year_covid_data: covid_data {
        ${measure_covid_data}
      }

      one_year_covid_data: covid_data(fiscal_year: 2020) {
        ${measure_covid_data}
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

      ${years_with_covid_data}
    }
  }
}`;

const gov_covid_summary_query = `
query ($lang: String = "en", $top_x: Int = 1) {
  root(lang: $lang) {
    gov {
      all_year_summaries: covid_summary {
        fiscal_year

        top_spending_orgs {
          org_id
          name
        }
        top_spending_measures(top_x: $top_x) {
          id
          name
        }

        covid_estimates {
          ${estimates_fields}
        }
        covid_expenditures {
          ${expenditures_fields}
        }

        measure_counts {
          with_authorities
          with_spending
        }
        org_counts {
          with_authorities
          with_spending
        }
      }

      one_year_summary: covid_summary(fiscal_year: 2020) {
        fiscal_year

        top_spending_orgs {
          org_id
          name
        }
        top_spending_measures(top_x: $top_x) {
          id
          name
        }

        covid_estimates {
          ${estimates_fields}
        }
        covid_expenditures {
          ${expenditures_fields}
        }

        measure_counts {
          with_authorities
          with_spending
        }
        org_counts {
          with_authorities
          with_spending
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

      all_year_summaries: covid_summary {
        fiscal_year
        covid_estimates {
          ${estimates_fields}
        }
        covid_expenditures {
          ${expenditures_fields}
        }
      }

      one_year_summary: covid_summary(fiscal_year: 2020) {
        fiscal_year
        covid_estimates {
          ${estimates_fields}
        }
        covid_expenditures {
          ${expenditures_fields}
        }
      }
    }
  }
}`;

const org_covid_measures_query = `
query ($lang: String = "en", $org_id: String = "133") {
  root(lang: $lang) {
    org(org_id: $org_id) {
      all_year_measures: covid_measures {
        id
        name

        ${years_with_covid_data}

        all_year_covid_data: covid_data(org_id: $org_id) {
          ${measure_covid_data}
        }

        one_year_covid_data: covid_data(fiscal_year: 2020, org_id: $org_id) {
          ${measure_covid_data}
        }
      }

      one_year_measures: covid_measures(fiscal_year: 2021) {
        id
        name

        ${years_with_covid_data}

        covid_data(fiscal_year: 2021, org_id: $org_id) {
          ${measure_covid_data}
        }
      }
    }
  }
}`;

const gov_years_with_covid_data_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    gov {
      ${years_with_covid_data}
    }
  }
}`;

const org_years_with_covid_data_query = `
query ($lang: String = "en") {
  root(lang: $lang) {
    has_data: org(org_id: "133") {
      ${years_with_covid_data}
    }
    does_not_have_data: org(org_id: "15") {
      ${years_with_covid_data}
    }
    only_has_estimates: org(org_id: "1") {
      ${years_with_covid_data}
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
  it("Gov years with covid data", async () => {
    const data = await execQuery(gov_years_with_covid_data_query, {});
    return expect(data).toMatchSnapshot();
  });
  it("Org years with covid data", async () => {
    const data = await execQuery(org_years_with_covid_data_query, {});
    return expect(data).toMatchSnapshot();
  });
});
