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

export const org_has_covid_data_query = build_org_query("has_covid_data");

const covid_measure_query_fragment = `
  covid_measures {
    id
    name
  }
`;
export const all_covid_measure_query = build_base_query(
  covid_measure_query_fragment
);
export const org_covid_measure_query = build_org_query(
  covid_measure_query_fragment
);

const covid_estimates_by_measure_query_fragment = `
  covid_measures {
    id
    name
  
    covid_estimates {
      org_id
      fiscal_year
      est_doc

      vote
      stat
    }
  }
`;
export const all_covid_estimates_by_measure_query = build_base_query(
  covid_estimates_by_measure_query_fragment
);
export const org_covid_estimates_by_measure_query = build_org_query(
  covid_estimates_by_measure_query_fragment
);

const covid_estimates_summary_query_fragment = `
  covid_estimates_summary {
    fiscal_year
    est_doc
    vote
    stat
  }
`;
export const gov_covid_estimates_summary_query = build_base_query(`
  gov {
    ${covid_estimates_by_measure_query_fragment}
  }
`);
export const org_covid_estimates_summary_query = build_org_query(
  covid_estimates_summary_query_fragment
);
