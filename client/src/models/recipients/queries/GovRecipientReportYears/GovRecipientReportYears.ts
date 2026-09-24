import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovRecipientReportYearsQuery,
  GovRecipientReportYearsQueryVariables,
} from "./GovRecipientReportYears.gql";
import { GovRecipientReportYearsDocument } from "./GovRecipientReportYears.gql";

export const {
  promisedGovRecipientReportYears,
  suspendedGovRecipientReportYears,
  useGovRecipientReportYears,
} = query_factory<
  GovRecipientReportYearsQuery,
  GovRecipientReportYearsQueryVariables
>()({
  query_name: "GovRecipientReportYears",
  query: GovRecipientReportYearsDocument,
  resolver: (response: GovRecipientReportYearsQuery) => response.root.gov,
});
