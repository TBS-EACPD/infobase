import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovPeopleSummaryQuery,
  GovPeopleSummaryQueryVariables,
} from "./GovPeopleSummary.gql";
import { GovPeopleSummaryDocument } from "./GovPeopleSummary.gql";

export const {
  promisedGovPeopleSummary,
  suspendedGovPeopleSummary,
  useGovPeopleSummary,
} = query_factory<GovPeopleSummaryQuery, GovPeopleSummaryQueryVariables>()({
  query_name: "GovPeopleSummary",
  query: GovPeopleSummaryDocument,
  resolver: (response: GovPeopleSummaryQuery) =>
    response?.root?.gov?.people_data,
}); 