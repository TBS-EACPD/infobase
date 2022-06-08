import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  SingleServiceQuery,
  SingleServiceQueryVariables,
} from "./SingleService.gql";
import { SingleServiceDocument } from "./SingleService.gql";

export const {
  promisedSingleService,
  suspendedSingleService,
  useSingleService,
} = query_factory<SingleServiceQuery, SingleServiceQueryVariables>()({
  query_name: "SingleService",
  query: SingleServiceDocument,
  resolver: (response: SingleServiceQuery) => response.root.service,
});
