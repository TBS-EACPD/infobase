import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  AllCovidExpendituresByMeasureIdQuery,
  AllCovidExpendituresByMeasureIdQueryVariables,
} from "./AllCovidExpendituresByMeasureId.gql";
import { AllCovidExpendituresByMeasureIdDocument } from "./AllCovidExpendituresByMeasureId.gql";

export const {
  promisedAllCovidExpendituresByMeasureId,
  suspendedAllCovidExpendituresByMeasureId,
  useAllCovidExpendituresByMeasureId,
} = query_factory<
  AllCovidExpendituresByMeasureIdQuery,
  AllCovidExpendituresByMeasureIdQueryVariables
>()({
  query_name: "AllCovidExpendituresByMeasureId",
  query: AllCovidExpendituresByMeasureIdDocument,
  resolver: (response: AllCovidExpendituresByMeasureIdQuery) =>
    _.chain(response.root?.covid_expenditures_by_measure)
      .compact()
      .flatMap(({ id: measure_id, covid_data }) =>
        _.chain(covid_data)
          .compact()
          .flatMap(({ fiscal_year, covid_expenditures }) =>
            _.map(covid_expenditures, (row) => ({
              measure_id,
              fiscal_year,
              ..._.omit(row, "__typename"),
            }))
          )
          .value()
      )
      .value(),
});
