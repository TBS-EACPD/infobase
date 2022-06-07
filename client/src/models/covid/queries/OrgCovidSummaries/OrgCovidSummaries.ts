import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgCovidSummariesQuery,
  OrgCovidSummariesQueryVariables,
} from "./OrgCovidSummaries.gql";
import { OrgCovidSummariesDocument } from "./OrgCovidSummaries.gql";

export const {
  promisedOrgCovidSummaries,
  suspendedOrgCovidSummaries,
  useOrgCovidSummaries,
} = query_factory<OrgCovidSummariesQuery, OrgCovidSummariesQueryVariables>()({
  query_name: "OrgCovidSummaries",
  query: OrgCovidSummariesDocument,
  resolver: (response: OrgCovidSummariesQuery) =>
    response?.root?.org?.covid_summary,
});
