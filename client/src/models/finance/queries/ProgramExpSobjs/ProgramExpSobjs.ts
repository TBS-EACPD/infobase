import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ProgramExpSobjsQuery,
  ProgramExpSobjsQueryVariables,
} from "./ProgramExpSobjs.gql";
import { ProgramExpSobjsDocument } from "./ProgramExpSobjs.gql";

export const {
  promisedProgramExpSobjs,
  suspendedProgramExpSobjs,
  useProgramExpSobjs,
} = query_factory<ProgramExpSobjsQuery, ProgramExpSobjsQueryVariables>()({
  query_name: "ProgramExpSobjs",
  query: ProgramExpSobjsDocument,
  resolver: (response: ProgramExpSobjsQuery) => response.root.program,
});
