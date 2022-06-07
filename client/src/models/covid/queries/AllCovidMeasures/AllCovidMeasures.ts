import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  AllCovidMeasuresQuery,
  AllCovidMeasuresQueryVariables,
} from "./AllCovidMeasures.gql";
import { AllCovidMeasuresDocument } from "./AllCovidMeasures.gql";

export const {
  promisedAllCovidMeasures,
  suspendedAllCovidMeasures,
  useAllCovidMeasures,
} = query_factory<AllCovidMeasuresQuery, AllCovidMeasuresQueryVariables>()({
  query_name: "AllCovidMeasures",
  query: AllCovidMeasuresDocument,
  resolver: (response: AllCovidMeasuresQuery) => response?.root?.covid_measures,
});
