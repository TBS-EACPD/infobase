import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptRecipientReportYearsQuery,
  DeptRecipientReportYearsQueryVariables,
} from "./DeptRecipientReportYears.gql";
import { DeptRecipientReportYearsDocument } from "./DeptRecipientReportYears.gql";

export const {
  promisedDeptRecipientReportYears,
  suspendedDeptRecipientReportYears,
  useDeptRecipientReportYears,
} = query_factory<
  DeptRecipientReportYearsQuery,
  DeptRecipientReportYearsQueryVariables
>()({
  query_name: "DeptRecipientReportYears",
  query: DeptRecipientReportYearsDocument,
  resolver: (response: DeptRecipientReportYearsQuery) => response.root.org,
});
