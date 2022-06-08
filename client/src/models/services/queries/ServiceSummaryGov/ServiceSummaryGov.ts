import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServiceSummaryGovQuery,
  ServiceSummaryGovQueryVariables,
} from "./ServiceSummaryGov.gql";
import { ServiceSummaryGovDocument } from "./ServiceSummaryGov.gql";

export const {
  promisedServiceSummaryGov,
  suspendedServiceSummaryGov,
  useServiceSummaryGov,
} = query_factory<ServiceSummaryGovQuery, ServiceSummaryGovQueryVariables>()({
  query_name: "ServiceSummaryGov",
  query: ServiceSummaryGovDocument,
  resolver: (response: ServiceSummaryGovQuery) =>
    response.root?.gov?.service_summary,
});
