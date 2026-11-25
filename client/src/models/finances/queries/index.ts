import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptHasFinanceDataQuery,
  DeptHasFinanceDataQueryVariables,
} from "./DeptHasFinanceData/DeptHasFinanceData.gql";
import { DeptHasFinanceDataDocument } from "./DeptHasFinanceData/DeptHasFinanceData.gql";

export const {
  promisedDeptHasFinanceData,
  suspendedDeptHasFinanceData,
  useDeptHasFinanceData,
} = query_factory<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>()({
  query_name: "DeptHasFinanceData",
  query: DeptHasFinanceDataDocument,
  resolver: (response) => response?.root?.org,
});
