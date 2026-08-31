import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientDetailsOrgQuery,
  RecipientDetailsOrgQueryVariables,
} from "./RecipientDetailsOrg.gql";
import { RecipientDetailsOrgDocument } from "./RecipientDetailsOrg.gql";

export const {
  promisedRecipientDetailsOrg,
  suspendedRecipientDetailsOrg,
  useRecipientDetailsOrg,
} = query_factory<
  RecipientDetailsOrgQuery,
  RecipientDetailsOrgQueryVariables
>()({
  query_name: "RecipientDetailsOrg",
  query: RecipientDetailsOrgDocument,
  resolver: (response: RecipientDetailsOrgQuery) =>
    response.root.org?.recipient_details,
});
