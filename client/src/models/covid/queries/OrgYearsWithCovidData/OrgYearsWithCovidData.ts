import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  OrgYearsWithCovidDataQuery,
  OrgYearsWithCovidDataQueryVariables,
} from "./OrgYearsWithCovidData.gql";
import { OrgYearsWithCovidDataDocument } from "./OrgYearsWithCovidData.gql";

export const {
  promisedOrgYearsWithCovidData,
  suspendedOrgYearsWithCovidData,
  useOrgYearsWithCovidData,
} = query_factory<
  OrgYearsWithCovidDataQuery,
  OrgYearsWithCovidDataQueryVariables
>()({
  query_name: "OrgYearsWithCovidData",
  query: OrgYearsWithCovidDataDocument,
  resolver: (response: OrgYearsWithCovidDataQuery) =>
    response?.root?.org?.years_with_covid_data,
});
