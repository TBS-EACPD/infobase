import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  RecipientsGeneralStatsQuery,
  RecipientsGeneralStatsQueryVariables,
} from "./RecipientsGeneralStats.gql";
import { RecipientsGeneralStatsDocument } from "./RecipientsGeneralStats.gql";

export const {
  promisedRecipientsGeneralStats,
  suspendedRecipientsGeneralStats,
  useRecipientsGeneralStats,
} = query_factory<
  RecipientsGeneralStatsQuery,
  RecipientsGeneralStatsQueryVariables
>()({
  query_name: "RecipientsGeneralStats",
  query: RecipientsGeneralStatsDocument,
  resolver: (response: RecipientsGeneralStatsQuery) =>
    response.root.org?.recipients_general_stats,
});
