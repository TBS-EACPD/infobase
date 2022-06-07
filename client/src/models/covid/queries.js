import { gql } from "@apollo/client";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { query_factory } from "src/graphql_utils/graphql_utils";

const years_with_covid_data = `
  years_with_covid_data {
    years_with_estimates
    years_with_expenditures
  }
`;
export const {
  promisedGovYearsWithCovidData,
  suspendedGovYearsWithCovidData,
  useGovYearsWithCovidData,
} = query_factory()({
  query_name: "GovYearsWithCovidData",
  query: gql`
    query($lang: String! = "${lang}") {
      root(lang: $lang) {
        gov {
          id
          ${years_with_covid_data}
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.gov.years_with_covid_data"),
});
export const {
  promisedOrgYearsWithCovidData,
  suspendedOrgYearsWithCovidData,
  useOrgYearsWithCovidData,
} = query_factory()({
  query_name: "OrgYearsWithCovidData",
  query: gql`
    query($lang: String! = "${lang}", $org_id: String!) {
      root(lang: $lang) {
        org(org_id: $org_id) {
          id
          ${years_with_covid_data}
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.org.years_with_covid_data"),
});

export const {
  promisedAllCovidMeasures,
  suspendedAllCovidMeasures,
  useAllCovidMeasures,
} = query_factory()({
  query_name: "AllCovidMeasures",
  query: gql`
    query($lang: String! = "${lang}") {
      root(lang: $lang) {
        covid_measures {
          id
          name
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.covid_measures"),
});

const covid_estimates_fields = `
  est_doc
  vote
  stat
`;
export const {
  promisedAllCovidEstimatesByMeasureId,
  suspendedAllCovidEstimatesByMeasureId,
  useAllCovidEstimatesByMeasureId,
} = query_factory()({
  query_name: "AllCovidEstimatesByMeasureId",
  query: gql`
    query($lang: String! = "${lang}", $fiscal_year: Int) {
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
  resolver: (response) =>
    _.chain(response)
      .get("root.covid_estimates_by_measure")
      .flatMap(({ id: measure_id, covid_data }) =>
        _.flatMap(covid_data, ({ fiscal_year, covid_estimates }) =>
          _.map(covid_estimates, (row) => ({
            measure_id,
            fiscal_year,
            ..._.omit(row, "__typename"),
          }))
        )
      )
      .value(),
});
export const {
  promisedOrgCovidEstimatesByMeasureId,
  suspendedOrgCovidEstimatesByMeasureId,
  useOrgCovidEstimatesByMeasureId,
} = query_factory()({
  query_name: "OrgCovidEstimatesByMeasureId",
  query: gql`
    query($lang: String! = "${lang}", $org_id: String!, $fiscal_year: Int) {
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
  resolver: (response) =>
    _.chain(response)
      .get("root.org.covid_estimates_by_measure")
      .flatMap(({ id: measure_id, covid_data }) =>
        _.flatMap(covid_data, ({ fiscal_year, covid_estimates }) =>
          _.map(covid_estimates, (row) => ({
            measure_id,
            fiscal_year,
            ..._.omit(row, "__typename"),
          }))
        )
      )
      .value(),
});

const covid_expenditures_fields = `
  vote
  stat
`;
export const {
  promisedAllCovidExpendituresByMeasureId,
  suspendedAllCovidExpendituresByMeasureId,
  useAllCovidExpendituresByMeasureId,
} = query_factory()({
  query_name: "AllCovidExpendituresByMeasureId",
  query: gql`
    query($lang: String! = "${lang}", $fiscal_year: Int) {
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
  resolver: (response) =>
    _.chain(response)
      .get("root.covid_expenditures_by_measure")
      .flatMap(({ id: measure_id, covid_data }) =>
        _.flatMap(covid_data, ({ fiscal_year, covid_expenditures }) =>
          _.map(covid_expenditures, (row) => ({
            measure_id,
            fiscal_year,
            ..._.omit(row, "__typename"),
          }))
        )
      )
      .value(),
});
export const {
  promisedOrgCovidExpendituresByMeasureId,
  suspendedOrgCovidExpendituresByMeasureId,
  useOrgCovidExpendituresByMeasureId,
} = query_factory()({
  query_name: "OrgCovidExpendituresByMeasureId",
  query: gql`
    query($lang: String! = "${lang}", $org_id: String!, $fiscal_year: Int) {
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
  resolver: (response) =>
    _.chain(response)
      .get("root.org.covid_expenditures_by_measure")
      .flatMap(({ id: measure_id, covid_data }) =>
        _.flatMap(covid_data, ({ fiscal_year, covid_expenditures }) =>
          _.map(covid_expenditures, (row) => ({
            measure_id,
            fiscal_year,
            ..._.omit(row, "__typename"),
          }))
        )
      )
      .value(),
});

const common_covid_summary_fields = `
  id

  fiscal_year

  covid_estimates {
    ${covid_estimates_fields}
  }
  covid_expenditures {
    month_last_updated
    ${covid_expenditures_fields}
  }
`;
export const {
  promisedGovCovidSummaries,
  suspendedGovCovidSummaries,
  useGovCovidSummaries,
} = query_factory()({
  query_name: "GovCovidSummaries",
  query: gql`
    query($lang: String! = "${lang}") {
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
  resolver: (response) => _.get(response, "root.gov.covid_summary"),
});
export const {
  promisedOrgCovidSummaries,
  suspendedOrgCovidSummaries,
  useOrgCovidSummaries,
} = query_factory()({
  query_name: "OrgCovidSummaries",
  query: gql`
    query($lang: String! = "${lang}", $org_id: String!) {
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
  resolver: (response) => _.get(response, "root.org.covid_summary"),
});
export const {
  promisedGovCovidSummary,
  suspendedGovCovidSummary,
  useGovCovidSummary,
} = query_factory()({
  query_name: "GovCovidSummary",
  query: gql`
    query($lang: String! = "${lang}", $fiscal_year: Int!) {
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
  resolver: (response) =>
    _.chain(response).get("root.gov.covid_summary").first().value(),
});
export const {
  promisedOrgCovidSummary,
  suspendedOrgCovidSummary,
  useOrgCovidSummary,
} = query_factory()({
  query_name: "OrgCovidSummary",
  query: gql`
    query($lang: String! = "${lang}", $org_id: String!, $fiscal_year: Int!) {
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
  resolver: (response) =>
    _.chain(response).get("root.org.covid_summary").first().value(),
});

export const {
  promisedTopCovidSpending,
  suspendedTopCovidSpending,
  useTopCovidSpending,
} = query_factory()({
  query_name: "TopCovidSpending",
  query: gql`
    query($lang: String! = "${lang}", $top_x: Int! = 4, $fiscal_year: Int!) {
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
  resolver: (response) =>
    _.chain(response)
      .get("root.gov.covid_summary")
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
      .value(),
});
