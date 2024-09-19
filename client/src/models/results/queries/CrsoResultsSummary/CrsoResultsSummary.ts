import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  CrsoResultsSummaryQuery,
  CrsoResultsSummaryQueryVariables,
} from "./CrsoResultsSummary.gql";
import { CrsoResultsSummaryDocument } from "./CrsoResultsSummary.gql";

export const {
  promisedCrsoResultsSummary,
  suspendedCrsoResultsSummary,
  useCrsoResultsSummary,
} = query_factory<CrsoResultsSummaryQuery, CrsoResultsSummaryQueryVariables>()({
  query_name: "CrsoResultsSummary",
  query: CrsoResultsSummaryDocument,
  resolver: (response: CrsoResultsSummaryQuery) => response.root.crso,
});
