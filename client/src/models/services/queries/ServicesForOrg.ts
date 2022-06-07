import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServicesForOrgQuery,
  ServicesForOrgQueryVariables,
} from "./ServicesForOrg.gql";
import { ServicesForOrgDocument } from "./ServicesForOrg.gql";

export const {
  promisedServicesForOrg,
  suspendedServicesForOrg,
  useServicesForOrg,
} = query_factory<ServicesForOrgQuery, ServicesForOrgQueryVariables>()({
  query_name: "ServicesForOrg",
  query: ServicesForOrgDocument,
  resolver: (response: ServicesForOrgQuery) => response.root.org?.services,
});
