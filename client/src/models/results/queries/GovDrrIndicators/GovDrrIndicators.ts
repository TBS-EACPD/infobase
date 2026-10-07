import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovDrrIndicatorsQuery,
  GovDrrIndicatorsQueryVariables,
} from "./GovDrrIndicators.gql";
import { GovDrrIndicatorsDocument } from "./GovDrrIndicators.gql";

export const {
  promisedGovDrrIndicators,
  suspendedGovDrrIndicators,
  useGovDrrIndicators,
} = query_factory<GovDrrIndicatorsQuery, GovDrrIndicatorsQueryVariables>()({
  query_name: "GovDrrIndicators",
  query: GovDrrIndicatorsDocument,
  resolver: (response: GovDrrIndicatorsQuery) =>
    response.root.gov?.departmental_result_indicators ?? [],
});
