import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientSummaryOrgQuery,
  RecipientSummaryOrgQueryVariables,
} from "./RecipientSummaryOrg.gql";
import { RecipientSummaryOrgDocument } from "./RecipientSummaryOrg.gql";

export const {
  promisedRecipientSummaryOrg,
  suspendedRecipientSummaryOrg,
  useRecipientSummaryOrg,
} = query_factory<
  RecipientSummaryOrgQuery,
  RecipientSummaryOrgQueryVariables
>()({
  query_name: "RecipientSummaryOrg",
  query: RecipientSummaryOrgDocument,
  resolver: (response: RecipientSummaryOrgQuery) =>
    response.root.org?.recipient_summary,
});
