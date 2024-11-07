import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ProgramRevSobjsQuery,
  ProgramRevSobjsQueryVariables,
} from "./ProgramRevSobjs.gql";
import { ProgramRevSobjsDocument } from "./ProgramRevSobjs.gql";

export const {
  promisedProgramRevSobjs,
  suspendedProgramRevSobjs,
  useProgramRevSobjs,
} = query_factory<ProgramRevSobjsQuery, ProgramRevSobjsQueryVariables>()({
  query_name: "ProgramRevSobjs",
  query: ProgramRevSobjsDocument,
  resolver: (response: ProgramRevSobjsQuery) => response.root.program,
});
