import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ProgramSobjsQuery,
  ProgramSobjsQueryVariables,
} from "./ProgramSobjs.gql";
import { ProgramSobjsDocument } from "./ProgramSobjs.gql";

export const { promisedProgramSobjs, suspendedProgramSobjs, useProgramSobjs } =
  query_factory<ProgramSobjsQuery, ProgramSobjsQueryVariables>()({
    query_name: "ProgramSobjs",
    query: ProgramSobjsDocument,
    resolver: (response: ProgramSobjsQuery) => response.root.program,
  });
