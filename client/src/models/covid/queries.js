import { gql } from "@apollo/client";

const years_with_covid_data = `
  years_with_covid_data {
    years_with_estimates
    years_with_expenditures
  }
`;
export const gov_years_with_covid_data_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      gov {
        id
        ${years_with_covid_data}
      }
    }
  }
`;
export const org_years_with_covid_data_query = gql`
  query($lang: String!, $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${years_with_covid_data}
      }
    }
  }
`;

const covid_measure_fields = `
  id
  name

  ${years_with_covid_data}
`;
const covid_measure_query_fragment = `
  covid_measures {
    ${covid_measure_fields}
  }
`;
export const all_covid_measure_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${covid_measure_query_fragment}
    }
  }
`;
export const org_covid_measure_query = gql`
query($lang: String!, $id: String!) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      ${covid_measure_query_fragment}
    }
  }
}
`;

const covid_estimates_fields = `
  est_doc
  vote
  stat
`;
const covid_estimates_by_measure_query_fragment = `
  covid_estimates_by_measure: covid_measures {
    ${covid_measure_fields}
  
    covid_data(fiscal_year: $fiscal_year) {
      fiscal_year

      covid_estimates {
        org_id
        ${covid_estimates_fields}
      }
    }
  }
`;
export const all_covid_estimates_by_measure_query = gql`
  query($lang: String!, $fiscal_year: Int) {
    root(lang: $lang) {
      ${covid_estimates_by_measure_query_fragment}
    }
  }
`;
export const org_covid_estimates_by_measure_query = gql`
query($lang: String!, $id: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      ${covid_estimates_by_measure_query_fragment}
    }
  }
}
`;

const covid_expenditures_fields = `
  vote
  stat
`;
const covid_expenditures_by_measure_query_fragment = `
  ${covid_measure_fields}
  
  covid_data(fiscal_year: $fiscal_year) {
    fiscal_year

    covid_expenditures {
      org_id
      ${covid_estimates_fields}
    }
  }
`;
export const all_covid_expenditures_by_measure_query = gql`
  query($lang: String!, $fiscal_year: Int) {
    root(lang: $lang) {
      covid_expenditures_by_measure: covid_measures(fiscal_year: $fiscal_year) {
        ${covid_expenditures_by_measure_query_fragment}
      }
    }
  }
`;
export const org_covid_expenditures_by_measure_query = gql`
query($lang: String!, $id: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      covid_expenditures_by_measure: covid_measures(org_id: $id, fiscal_year: $fiscal_year) {
        ${covid_expenditures_by_measure_query_fragment}
      }
    }
  }
}
`;

const covid_count_query_fields = `
  with_authorities
  with_spending
`;
const common_covid_summary_fields = `
  id

  fiscal_year

  covid_estimates {
    ${covid_estimates_fields}
  }
  covid_expenditures {
    ${covid_expenditures_fields}
  }
`;
export const gov_covid_summary_query = gql`
  query($lang: String!, $fiscal_year: Int) {
    root(lang: $lang) {
      gov {
        id
        covid_summary(fiscal_year: $fiscal_year) {
          ${common_covid_summary_fields}
          
          measure_counts {
            ${covid_count_query_fields}
          }
          org_counts {
            ${covid_count_query_fields}
          }
        }
      }
    }
  }
`;
export const org_covid_summary_query = gql`
query($lang: String!, $id: String!, $fiscal_year: Int) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      covid_summary(fiscal_year: $fiscal_year) {
        ${common_covid_summary_fields}
      }
    }
  }
}
`;

const top_x = 4;
export const top_covid_spending_query = gql`
  query($lang: String!, $fiscal_year: Int) {
    root(lang: $lang) {
      gov {
        id
        covid_summary(fiscal_year: $fiscal_year) {
          id
          fiscal_year

          top_spending_orgs(top_x: ${top_x}) {
            id
            name
            covid_summary(fiscal_year: $fiscal_year) {
              fiscal_year

              covid_expenditures {
                ${covid_expenditures_fields}
              }
            }
          }
          top_spending_measures(top_x: ${top_x}) {
            id
            name

            covid_data(fiscal_year: $fiscal_year) {
              fiscal_year
        
              covid_expenditures {
                org_id
                ${covid_expenditures_fields}
              }
            }
          }
        }
      }
    }
  }
`;
