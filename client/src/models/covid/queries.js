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

const has_covid_data_fields = `
  has_covid_data {
    has_estimates
    has_expenditures
  }
`;
export const org_has_covid_data_query = build_org_query(has_covid_data_fields);

const covid_measure_fields = `
  id
  name

  ${has_covid_data_fields}
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
  fiscal_year
  est_doc
  vote
  stat
`;
const covid_estimates_by_measure_query_fragment = `
  covid_estimates_by_measure: covid_measures {
    ${covid_measure_fields}
  
    covid_estimates {
      org_id
      ${covid_estimates_fields}
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
  fiscal_year
  vote
  stat
`;
const covid_expenditures_by_measure_query_fragment = `
  covid_expenditures_by_measure: covid_measures {
    ${covid_measure_fields}
  
    covid_expenditures {
      org_id
      
      ${covid_expenditures_fields}
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
  fiscal_year
  with_authorities
  with_spending
`;
const common_covid_summary_query_fragment = `
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
      id
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
          top_spending_orgs(top_x: ${top_x}) {
            id
            name
            covid_summary {
              covid_expenditures {
                ${covid_expenditures_fields}
              }
            }
          }
          top_spending_measures(top_x: ${top_x}) {
            id
            name
            covid_expenditures {
              org_id

              ${covid_expenditures_fields}
            }
          }
        }
      }
    }
  }
`;
