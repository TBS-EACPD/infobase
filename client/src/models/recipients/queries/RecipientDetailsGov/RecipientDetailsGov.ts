import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientDetailsGovQuery,
  RecipientDetailsGovQueryVariables,
} from "./RecipientDetailsGov.gql";
import { RecipientDetailsGovDocument } from "./RecipientDetailsGov.gql";

export const {
  promisedRecipientDetailsGov,
  suspendedRecipientDetailsGov,
  useRecipientDetailsGov,
} = query_factory<
  RecipientDetailsGovQuery,
  RecipientDetailsGovQueryVariables
>()({
  query_name: "RecipientDetailsGov",
  query: RecipientDetailsGovDocument,
  resolver: (response: RecipientDetailsGovQuery) =>
    response.root.gov?.recipient_details,
});
