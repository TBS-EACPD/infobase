import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  GovYearsWithCovidDataQuery,
  GovYearsWithCovidDataQueryVariables,
} from "./GovYearsWithCovidData.gql";
import { GovYearsWithCovidDataDocument } from "./GovYearsWithCovidData.gql";

export const {
  promisedGovYearsWithCovidData,
  suspendedGovYearsWithCovidData,
  useGovYearsWithCovidData,
} = query_factory<
  GovYearsWithCovidDataQuery,
  GovYearsWithCovidDataQueryVariables
>()({
  query_name: "GovYearsWithCovidData",
  query: GovYearsWithCovidDataDocument,
  resolver: (response: GovYearsWithCovidDataQuery) =>
    response?.root?.gov?.years_with_covid_data,
});
