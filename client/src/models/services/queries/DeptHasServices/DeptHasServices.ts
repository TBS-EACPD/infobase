import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptHasServicesQuery,
  DeptHasServicesQueryVariables,
} from "./DeptHasServices.gql";
import { DeptHasServicesDocument } from "./DeptHasServices.gql";

export const {
  promisedDeptHasServices,
  suspendedDeptHasServices,
  useDeptHasServices,
} = query_factory<DeptHasServicesQuery, DeptHasServicesQueryVariables>()({
  query_name: "DeptHasServices",
  query: DeptHasServicesDocument,
  resolver: (response: DeptHasServicesQuery) => response.root.org,
});
