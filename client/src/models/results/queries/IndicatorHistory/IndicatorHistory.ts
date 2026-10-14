import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  IndicatorHistoryQuery,
  IndicatorHistoryQueryVariables,
} from "./IndicatorHistory.gql";
import { IndicatorHistoryDocument } from "./IndicatorHistory.gql";

export const {
  promisedIndicatorHistory,
  suspendedIndicatorHistory,
  useIndicatorHistory,
} = query_factory<IndicatorHistoryQuery, IndicatorHistoryQueryVariables>()({
  query_name: "IndicatorHistory",
  query: IndicatorHistoryDocument,
  resolver: (response: IndicatorHistoryQuery) =>
    response.root.indicators_by_stable_id ?? [],
});
