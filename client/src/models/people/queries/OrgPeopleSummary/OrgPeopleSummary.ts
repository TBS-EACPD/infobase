import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgPeopleSummaryQuery,
  OrgPeopleSummaryQueryVariables,
} from "./OrgPeopleSummary.gql";
import { OrgPeopleSummaryDocument } from "./OrgPeopleSummary.gql";

export const {
  promisedOrgPeopleSummary,
  suspendedOrgPeopleSummary,
  useOrgPeopleSummary,
} = query_factory<OrgPeopleSummaryQuery, OrgPeopleSummaryQueryVariables>()({
  query_name: "OrgPeopleSummary",
  query: OrgPeopleSummaryDocument,
  resolver: (response: OrgPeopleSummaryQuery) =>
    response?.root?.org?.people_data,
});
