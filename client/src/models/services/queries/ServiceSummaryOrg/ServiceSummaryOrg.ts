import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServiceSummaryOrgQuery,
  ServiceSummaryOrgQueryVariables,
} from "./ServiceSummaryOrg.gql";
import { ServiceSummaryOrgDocument } from "./ServiceSummaryOrg.gql";

export const {
  promisedServiceSummaryOrg,
  suspendedServiceSummaryOrg,
  useServiceSummaryOrg,
} = query_factory<ServiceSummaryOrgQuery, ServiceSummaryOrgQueryVariables>()({
  query_name: "ServiceSummaryOrg",
  query: ServiceSummaryOrgDocument,
  resolver: (response: ServiceSummaryOrgQuery) =>
    response.root?.org?.service_summary,
});
