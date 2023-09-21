import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  TopCovidSpendingQuery,
  TopCovidSpendingQueryVariables,
} from "./TopCovidSpending.gql";
import { TopCovidSpendingDocument } from "./TopCovidSpending.gql";

export const {
  promisedTopCovidSpending,
  suspendedTopCovidSpending,
  useTopCovidSpending,
} = query_factory<TopCovidSpendingQuery, TopCovidSpendingQueryVariables>()({
  query_name: "TopCovidSpending",
  query: TopCovidSpendingDocument,
  resolver: (response: TopCovidSpendingQuery) =>
    _.chain(response?.root?.gov?.covid_summary)
      .head()
      .thru(({ top_spending_orgs, top_spending_measures }) => ({
        top_spending_orgs: _.map(
          _.compact(top_spending_orgs),
          ({ name, covid_summary }) => ({
            name,
            spending: _.chain(covid_summary)
              .head()
              .get("covid_expenditures")
              .thru(({ vote, stat }) => (vote || 0) + (stat || 0))
              .value(),
          })
        ),
        top_spending_measures: _.map(
          _.compact(top_spending_measures),
          ({ name, covid_data }) => ({
            name,
            spending: _.chain(covid_data)
              .head()
              .get("covid_expenditures")
              .compact()
              .reduce(
                (memo, { vote, stat }) => memo + (vote || 0) + (stat || 0),
                0
              )
              .value(),
          })
        ),
      }))
      .value(),
});
