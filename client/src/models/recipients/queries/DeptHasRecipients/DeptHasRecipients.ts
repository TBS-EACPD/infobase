import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  DeptHasRecipientsQuery,
  DeptHasRecipientsQueryVariables,
} from "./DeptHasRecipients.gql";
import { DeptHasRecipientsDocument } from "./DeptHasRecipients.gql";

export const {
  promisedDeptHasRecipients,
  suspendedDeptHasRecipients,
  useDeptHasRecipients,
} = query_factory<DeptHasRecipientsQuery, DeptHasRecipientsQueryVariables>()({
  query_name: "DeptHasRecipients",
  query: DeptHasRecipientsDocument,
  resolver: (response: DeptHasRecipientsQuery) => response.root.org,
});
