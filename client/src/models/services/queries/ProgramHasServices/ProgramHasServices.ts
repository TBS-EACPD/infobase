import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ProgramHasServicesQuery,
  ProgramHasServicesQueryVariables,
} from "./ProgramHasServices.gql";
import { ProgramHasServicesDocument } from "./ProgramHasServices.gql";

export const {
  promisedProgramHasServices,
  suspendedProgramHasServices,
  useProgramHasServices,
} = query_factory<ProgramHasServicesQuery, ProgramHasServicesQueryVariables>()({
  query_name: "ProgramHasServices",
  query: ProgramHasServicesDocument,
  resolver: (response: ProgramHasServicesQuery) => response.root.program,
});
