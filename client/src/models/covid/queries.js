import { gql } from "@apollo/client";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants.js";

import {
  get_client,
  query_logging_wrapper,
} from "src/graphql_utils/graphql_utils.js";

const client = get_client();

const years_with_covid_data = `
  years_with_covid_data {
    years_with_estimates
    years_with_expenditures
  }
`;
export const query_gov_years_with_covid_data = query_logging_wrapper(
  "gov_years_with_covid_data",
  ({ ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!) {
            root(lang: $lang) {
              gov {
                id
                ${years_with_covid_data}
              }
            }
          }
        `,
        variables: {
          lang,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.get(response, "data.root.gov.years_with_covid_data")
      )
);
export const query_org_years_with_covid_data = query_logging_wrapper(
  "org_years_with_covid_data",
  ({ org_id, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $org_id: String!) {
            root(lang: $lang) {
              org(org_id: $org_id) {
                id
                ${years_with_covid_data}
              }
            }
          }
        `,
        variables: {
          lang,
          org_id,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.get(response, "data.root.org.years_with_covid_data")
      )
);

export const query_all_covid_measures = query_logging_wrapper(
  "all_covid_measures",
  ({ ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!) {
            root(lang: $lang) {
              covid_measures {
                id
                name
              }
            }
          }
        `,
        variables: {
          lang,
          ...logging_variables,
        },
      })
      .then((response) => _.get(response, "data.root.covid_measures"))
);

const covid_estimates_fields = `
  est_doc
  vote
  stat
`;
export const query_all_covid_estimates_by_measure_id = query_logging_wrapper(
  "all_covid_estimates_by_measure",
  ({ fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $fiscal_year: Int) {
            root(lang: $lang) {
              covid_estimates_by_measure: covid_measures(fiscal_year: $fiscal_year) {
                id
  
                covid_data(fiscal_year: $fiscal_year) {
                  fiscal_year

                  covid_estimates {
                    org_id
                    ${covid_estimates_fields}
                  }
                }
              }
            }
          }
        `,
        variables: {
          lang,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response)
          .get("data.root.covid_estimates_by_measure")
          .flatMap(({ id: measure_id, covid_data }) =>
            _.flatMap(covid_data, ({ fiscal_year, covid_estimates }) =>
              _.map(covid_estimates, (row) => ({
                measure_id,
                fiscal_year,
                ..._.omit(row, "__typename"),
              }))
            )
          )
          .value()
      )
);
export const query_org_covid_estimates_by_measure_id = query_logging_wrapper(
  "org_covid_estimates_by_measure",
  ({ org_id, fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $org_id: String!, $fiscal_year: Int) {
            root(lang: $lang) {
              org(org_id: $org_id) {
                id
                covid_estimates_by_measure: covid_measures(fiscal_year: $fiscal_year) {
                  id
  
                  covid_data(fiscal_year: $fiscal_year, org_id: $org_id) {
                    fiscal_year

                    covid_estimates {
                      org_id
                      ${covid_estimates_fields}
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          lang,
          org_id,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response)
          .get("data.root.org.covid_estimates_by_measure")
          .flatMap(({ id: measure_id, covid_data }) =>
            _.flatMap(covid_data, ({ fiscal_year, covid_estimates }) =>
              _.map(covid_estimates, (row) => ({
                measure_id,
                fiscal_year,
                ..._.omit(row, "__typename"),
              }))
            )
          )
          .value()
      )
);

const covid_expenditures_fields = `
  vote
  stat
`;
export const query_all_covid_expenditures_by_measure_id = query_logging_wrapper(
  "all_covid_expenditures_by_measure",
  ({ fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
         query($lang: String!, $fiscal_year: Int) {
           root(lang: $lang) {
             covid_expenditures_by_measure: covid_measures(fiscal_year: $fiscal_year) {
                id
  
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
       `,
        variables: {
          lang,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response)
          .get("data.root.covid_expenditures_by_measure")
          .flatMap(({ id: measure_id, covid_data }) =>
            _.flatMap(covid_data, ({ fiscal_year, covid_expenditures }) =>
              _.map(covid_expenditures, (row) => ({
                measure_id,
                fiscal_year,
                ..._.omit(row, "__typename"),
              }))
            )
          )
          .value()
      )
);
export const query_org_covid_expenditures_by_measure_id = query_logging_wrapper(
  "org_covid_expenditures_by_measure",
  ({ org_id, fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $org_id: String!, $fiscal_year: Int) {
            root(lang: $lang) {
              org(org_id: $org_id) {
                id
                covid_expenditures_by_measure: covid_measures(fiscal_year: $fiscal_year) {
                  id

                  covid_data(fiscal_year: $fiscal_year, org_id: $org_id) {
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
        `,
        variables: {
          lang,
          org_id,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response)
          .get("data.root.org.covid_expenditures_by_measure")
          .flatMap(({ id: measure_id, covid_data }) =>
            _.flatMap(covid_data, ({ fiscal_year, covid_expenditures }) =>
              _.map(covid_expenditures, (row) => ({
                measure_id,
                fiscal_year,
                ..._.omit(row, "__typename"),
              }))
            )
          )
          .value()
      )
);

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
export const query_gov_covid_summaries = query_logging_wrapper(
  "gov_covid_summaries",
  ({ ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!) {
            root(lang: $lang) {
              gov {
                id
                covid_summary {
                  ${common_covid_summary_fields}
                }
              }
            }
          }
        `,
        variables: {
          lang,
          ...logging_variables,
        },
      })
      .then((response) => _.get(response, "data.root.gov.covid_summary"))
);
export const query_org_covid_summaries = query_logging_wrapper(
  "org_covid_summaries",
  ({ org_id, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $org_id: String!) {
            root(lang: $lang) {
              org(org_id: $org_id) {
                id
                covid_summary {
                  ${common_covid_summary_fields}
                }
              }
            }
          }
        `,
        variables: {
          lang,
          org_id,
          ...logging_variables,
        },
      })
      .then((response) => _.get(response, "data.root.org.covid_summary"))
);
export const query_gov_covid_summary = query_logging_wrapper(
  "gov_covid_summary",
  ({ fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $fiscal_year: Int!) {
            root(lang: $lang) {
              gov {
                id
                covid_summary(fiscal_year: $fiscal_year) {
                  ${common_covid_summary_fields}
                }
              }
            }
          }
        `,
        variables: {
          lang,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response).get("data.root.gov.covid_summary").first().value()
      )
);
export const query_org_covid_summary = query_logging_wrapper(
  "org_covid_summary",
  ({ org_id, fiscal_year, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $org_id: String!, $fiscal_year: Int!) {
            root(lang: $lang) {
              org(org_id: $org_id) {
                id
                covid_summary(fiscal_year: $fiscal_year) {
                  ${common_covid_summary_fields}
                }
              }
            }
          }
        `,
        variables: {
          lang,
          org_id,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response).get("data.root.org.covid_summary").first().value()
      )
);

export const query_top_covid_spending = query_logging_wrapper(
  "top_covid_spending",
  ({ fiscal_year, top_x = 4, ...logging_variables }) =>
    client
      .query({
        query: gql`
          query($lang: String!, $top_x: Int!, $fiscal_year: Int!) {
            root(lang: $lang) {
              gov {
                id
                covid_summary(fiscal_year: $fiscal_year) {
                  id
                  fiscal_year
        
                  top_spending_orgs(top_x: $top_x) {
                    id
                    name

                    covid_summary(fiscal_year: $fiscal_year) {
                      fiscal_year
        
                      covid_expenditures {
                        ${covid_expenditures_fields}
                      }
                    }
                  }
                  top_spending_measures(top_x: $top_x) {
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
        `,
        variables: {
          lang,
          top_x,
          fiscal_year,
          ...logging_variables,
        },
      })
      .then((response) =>
        _.chain(response)
          .get("data.root.gov.covid_summary")
          .first()
          .thru(({ top_spending_orgs, top_spending_measures }) => ({
            top_spending_orgs: _.map(
              top_spending_orgs,
              ({ name, covid_summary }) => ({
                name,
                spending: _.chain(covid_summary)
                  .first()
                  .get("covid_expenditures")
                  .thru(({ vote, stat }) => vote + stat)
                  .value(),
              })
            ),
            top_spending_measures: _.map(
              top_spending_measures,
              ({ name, covid_data }) => ({
                name,
                spending: _.chain(covid_data)
                  .first()
                  .get("covid_expenditures")
                  .reduce((memo, { vote, stat }) => memo + vote + stat, 0)
                  .value(),
              })
            ),
          }))
          .value()
      )
);
