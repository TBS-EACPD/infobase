import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovCovidSummaryQuery,
  GovCovidSummaryQueryVariables,
} from "./GovCovidSummary.gql";
import { GovCovidSummaryDocument } from "./GovCovidSummary.gql";

export const {
  promisedGovCovidSummary,
  suspendedGovCovidSummary,
  useGovCovidSummary,
} = query_factory<GovCovidSummaryQuery, GovCovidSummaryQueryVariables>()({
  query_name: "GovCovidSummary",
  query: GovCovidSummaryDocument,
  resolver: (response: GovCovidSummaryQuery) =>
    _.head(response?.root?.gov?.covid_summary),
});
