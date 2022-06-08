import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  SearchServicesQuery,
  SearchServicesQueryVariables,
} from "./SearchServices.gql";
import { SearchServicesDocument } from "./SearchServices.gql";

export const {
  promisedSearchServices,
  suspendedSearchServices,
  useSearchServices,
} = query_factory<SearchServicesQuery, SearchServicesQueryVariables>()({
  query_name: "SearchServices",
  query: SearchServicesDocument,
  resolver: (response: SearchServicesQuery) => response.root.search_services,
});
