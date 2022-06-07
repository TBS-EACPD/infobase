import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgCovidEstimatesByMeasureIdQuery,
  OrgCovidEstimatesByMeasureIdQueryVariables,
} from "./OrgCovidEstimatesByMeasureId.gql";
import { OrgCovidEstimatesByMeasureIdDocument } from "./OrgCovidEstimatesByMeasureId.gql";

export const {
  promisedOrgCovidEstimatesByMeasureId,
  suspendedOrgCovidEstimatesByMeasureId,
  useOrgCovidEstimatesByMeasureId,
} = query_factory<
  OrgCovidEstimatesByMeasureIdQuery,
  OrgCovidEstimatesByMeasureIdQueryVariables
>()({
  query_name: "OrgCovidEstimatesByMeasureId",
  query: OrgCovidEstimatesByMeasureIdDocument,
  resolver: (response: OrgCovidEstimatesByMeasureIdQuery) =>
    _.chain(response?.root?.org?.covid_estimates_by_measure)
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
