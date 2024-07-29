import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ProgramResultsSummaryQuery,
  ProgramResultsSummaryQueryVariables,
} from "./ProgramResultsSummary.gql";
import { ProgramResultsSummaryDocument } from "./ProgramResultsSummary.gql";

export const {
  promisedProgramResultsSummary,
  suspendedProgramResultsSummary,
  useProgramResultsSummary,
} = query_factory<
  ProgramResultsSummaryQuery,
  ProgramResultsSummaryQueryVariables
>()({
  query_name: "ProgramResultsSummary",
  query: ProgramResultsSummaryDocument,
  resolver: (response: ProgramResultsSummaryQuery) => response.root.program,
});
