import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptResultsSummaryQuery,
  DeptResultsSummaryQueryVariables,
} from "./DeptResultsSummary.gql";
import { DeptResultsSummaryDocument } from "./DeptResultsSummary.gql";

export const {
  promisedDeptResultsSummary,
  suspendedDeptResultsSummary,
  useDeptResultsSummary,
} = query_factory<DeptResultsSummaryQuery, DeptResultsSummaryQueryVariables>()({
  query_name: "DeptResultsSummary",
  query: DeptResultsSummaryDocument,
  resolver: (response: DeptResultsSummaryQuery) => response.root.org?.crsos,
});
