import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServiceSummaryProgramQuery,
  ServiceSummaryProgramQueryVariables,
} from "./ServiceSummaryProgram.gql";
import { ServiceSummaryProgramDocument } from "./ServiceSummaryProgram.gql";

export const {
  promisedServiceSummaryProgram,
  suspendedServiceSummaryProgram,
  useServiceSummaryProgram,
} = query_factory<
  ServiceSummaryProgramQuery,
  ServiceSummaryProgramQueryVariables
>()({
  query_name: "ServiceSummaryProgram",
  query: ServiceSummaryProgramDocument,
  resolver: (response: ServiceSummaryProgramQuery) =>
    response.root?.program?.service_summary,
});
