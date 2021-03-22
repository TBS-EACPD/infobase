import { gql } from "@apollo/client";

const build_base_query = (inner_fragment) => gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${inner_fragment}
    }
  }
`;

const build_org_query = (inner_fragment) => gql`
  query($lang: String! $id: String!) {
    root(lang: $lang) {
      org(org_id: $id) {
        id
        ${inner_fragment}
      }
    }
  }
`;

const years_with_covid_data = `
  years_with_covid_data {
    years_with_estimates
    years_with_expenditures
  }
`;
export const org_years_with_covid_data_query = build_org_query(
  years_with_covid_data
);

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
export const all_covid_measure_query = build_base_query(
  covid_measure_query_fragment
);
export const org_covid_measure_query = build_org_query(
  covid_measure_query_fragment
);

const covid_estimates_fields = `
  est_doc
  vote
  stat
`;
const covid_estimates_by_measure_query_fragment = `
  covid_estimates_by_measure: covid_measures {
    ${covid_measure_fields}
  
    covid_data {
      fiscal_year

      covid_estimates {
        org_id
        ${covid_estimates_fields}
      }
    }
  }
`;
export const all_covid_estimates_by_measure_query = build_base_query(
  covid_estimates_by_measure_query_fragment
);
export const org_covid_estimates_by_measure_query = build_org_query(
  covid_estimates_by_measure_query_fragment
);

const covid_expenditures_fields = `
  vote
  stat
`;
const covid_expenditures_by_measure_query_fragment = `
  covid_expenditures_by_measure: covid_measures {
    ${covid_measure_fields}
  
    covid_data {
      fiscal_year

      covid_expenditures {
        org_id
        ${covid_estimates_fields}
      }
    }
  }
`;
export const all_covid_expenditures_by_measure_query = build_base_query(
  covid_expenditures_by_measure_query_fragment
);
export const org_covid_expenditures_by_measure_query = build_org_query(
  covid_expenditures_by_measure_query_fragment
);

const covid_count_query_fields = `
  with_authorities
  with_spending
`;
const common_covid_summary_query_fragment = `
  id

  fiscal_year

  covid_estimates {
    ${covid_estimates_fields}
  }
  covid_expenditures {
    ${covid_expenditures_fields}
  }
`;
export const gov_covid_summary_query = build_base_query(`
  gov {
    id
    covid_summary {
      ${common_covid_summary_query_fragment}
      
      measure_counts {
        ${covid_count_query_fields}
      }
      org_counts {
        ${covid_count_query_fields}
      }
    }
  }
`);
export const org_covid_summary_query = build_org_query(`
  covid_summary {
    ${common_covid_summary_query_fragment}
  }
`);

const top_x = 4;
export const top_covid_spending_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      gov {
        id
        covid_summary {
          id
          fiscal_year

          top_spending_orgs(top_x: ${top_x}) {
            id
            name
            covid_summary {
              fiscal_year

              covid_expenditures {
                ${covid_expenditures_fields}
              }
            }
          }
          top_spending_measures(top_x: ${top_x}) {
            id
            name

            covid_data {
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
