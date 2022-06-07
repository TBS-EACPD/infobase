import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovCovidSummariesQuery,
  GovCovidSummariesQueryVariables,
} from "./GovCovidSummaries.gql";
import { GovCovidSummariesDocument } from "./GovCovidSummaries.gql";

export const {
  promisedGovCovidSummaries,
  suspendedGovCovidSummaries,
  useGovCovidSummaries,
} = query_factory<GovCovidSummariesQuery, GovCovidSummariesQueryVariables>()({
  query_name: "GovCovidSummaries",
  query: GovCovidSummariesDocument,
  resolver: (response: GovCovidSummariesQuery) =>
    response?.root?.gov?.covid_summary,
});
