import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptHasPeopleDataQuery,
  DeptHasPeopleDataQueryVariables,
} from "./DeptHasPeopleData.gql";
import { DeptHasPeopleDataDocument } from "./DeptHasPeopleData.gql";

export const {
  promisedDeptHasPeopleData,
  suspendedDeptHasPeopleData,
  useDeptHasPeopleData,
} = query_factory<DeptHasPeopleDataQuery, DeptHasPeopleDataQueryVariables>()({
  query_name: "DeptHasPeopleData",
  query: DeptHasPeopleDataDocument,
  resolver: (response: DeptHasPeopleDataQuery) => response.root.org,
});
