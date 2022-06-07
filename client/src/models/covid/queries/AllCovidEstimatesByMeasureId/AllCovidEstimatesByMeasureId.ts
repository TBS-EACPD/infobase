import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  AllCovidEstimatesByMeasureIdQuery,
  AllCovidEstimatesByMeasureIdQueryVariables,
} from "./AllCovidEstimatesByMeasureId.gql";
import { AllCovidEstimatesByMeasureIdDocument } from "./AllCovidEstimatesByMeasureId.gql";

export const {
  promisedAllCovidEstimatesByMeasureId,
  suspendedAllCovidEstimatesByMeasureId,
  useAllCovidEstimatesByMeasureId,
} = query_factory<
  AllCovidEstimatesByMeasureIdQuery,
  AllCovidEstimatesByMeasureIdQueryVariables
>()({
  query_name: "AllCovidEstimatesByMeasureId",
  query: AllCovidEstimatesByMeasureIdDocument,
  resolver: (response: AllCovidEstimatesByMeasureIdQuery) =>
    _.chain(response?.root?.covid_estimates_by_measure)
      .compact()
      .flatMap(({ id: measure_id, covid_data }) =>
        _.chain(covid_data)
          .compact()
          .flatMap(({ fiscal_year, covid_estimates }) =>
            _.map(covid_estimates, (row) => ({
              measure_id,
              fiscal_year,
              ..._.omit(row, "__typename"),
            }))
          )
          .value()
      )
      .value(),
});
