import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientSummaryGovQuery,
  RecipientSummaryGovQueryVariables,
} from "./RecipientSummaryGov.gql";
import { RecipientSummaryGovDocument } from "./RecipientSummaryGov.gql";

export const {
  promisedRecipientSummaryGov,
  suspendedRecipientSummaryGov,
  useRecipientSummaryGov,
} = query_factory<
  RecipientSummaryGovQuery,
  RecipientSummaryGovQueryVariables
>()({
  query_name: "RecipientSummaryGov",
  query: RecipientSummaryGovDocument,
  resolver: (response: RecipientSummaryGovQuery) =>
    response.root.gov?.recipient_summary,
});
