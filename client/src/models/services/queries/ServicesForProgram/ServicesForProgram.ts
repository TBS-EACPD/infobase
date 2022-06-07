import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServicesForProgramQueryVariables,
  ServicesForProgramQuery,
} from "./ServicesForProgram.gql";
import { ServicesForProgramDocument } from "./ServicesForProgram.gql";

export const {
  promisedServicesForProgram,
  suspendedServicesForProgram,
  useServicesForProgram,
} = query_factory<ServicesForProgramQuery, ServicesForProgramQueryVariables>()({
  query_name: "ServicesForProgram",
  query: ServicesForProgramDocument,
  resolver: (response: ServicesForProgramQuery) =>
    response.root.program?.services,
});
