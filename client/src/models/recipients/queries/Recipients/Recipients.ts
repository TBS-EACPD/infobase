import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientsQuery,
  RecipientsQueryVariables,
} from "./Recipients.gql";
import { RecipientsDocument } from "./Recipients.gql";

export const { promisedRecipients, suspendedRecipients, useRecipients } =
  query_factory<RecipientsQuery, RecipientsQueryVariables>()({
    query_name: "Recipients",
    query: RecipientsDocument,
    resolver: (response: RecipientsQuery) => response.root.org?.recipients,
  });
