import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgCovidSummaryQuery,
  OrgCovidSummaryQueryVariables,
} from "./OrgCovidSummary.gql";
import { OrgCovidSummaryDocument } from "./OrgCovidSummary.gql";

export const {
  promisedOrgCovidSummary,
  suspendedOrgCovidSummary,
  useOrgCovidSummary,
} = query_factory<OrgCovidSummaryQuery, OrgCovidSummaryQueryVariables>()({
  query_name: "OrgCovidSummary",
  query: OrgCovidSummaryDocument,
  resolver: (response: OrgCovidSummaryQuery) =>
    _.head(response?.root?.org?.covid_summary),
});
