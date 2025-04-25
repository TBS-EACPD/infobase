import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientsForOrgQuery,
  RecipientsForOrgQueryVariables,
} from "./RecipientsForOrg.gql";
import { RecipientsForOrgDocument } from "./RecipientsForOrg.gql";

export const {
  promisedRecipientsForOrg,
  suspendedRecipientsForOrg,
  useRecipientsForOrg,
} = query_factory<RecipientsForOrgQuery, RecipientsForOrgQueryVariables>()({
  query_name: "RecipientsForOrg",
  query: RecipientsForOrgDocument,
  resolver: (response: RecipientsForOrgQuery) => response.root.org?.recipients,
});
