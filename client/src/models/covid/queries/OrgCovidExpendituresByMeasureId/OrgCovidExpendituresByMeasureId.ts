import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgCovidExpendituresByMeasureIdQuery,
  OrgCovidExpendituresByMeasureIdQueryVariables,
} from "./OrgCovidExpendituresByMeasureId.gql";
import { OrgCovidExpendituresByMeasureIdDocument } from "./OrgCovidExpendituresByMeasureId.gql";

export const {
  promisedOrgCovidExpendituresByMeasureId,
  suspendedOrgCovidExpendituresByMeasureId,
  useOrgCovidExpendituresByMeasureId,
} = query_factory<
  OrgCovidExpendituresByMeasureIdQuery,
  OrgCovidExpendituresByMeasureIdQueryVariables
>()({
  query_name: "OrgCovidExpendituresByMeasureId",
  query: OrgCovidExpendituresByMeasureIdDocument,
  resolver: (response: OrgCovidExpendituresByMeasureIdQuery) =>
    _.chain(response?.root?.org?.covid_expenditures_by_measure)
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
