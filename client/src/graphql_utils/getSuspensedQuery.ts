import type { DocumentNode } from "graphql";
import { suspend } from "suspend-react";

import { get_client } from "./graphql_utils";

export function getSuspensedQuery<Query, Variables>(
  query: DocumentNode,
  variables?: Variables
): Query {
  const apolloClient = get_client();
  const key = query?.loc?.source?.body + JSON.stringify(variables);

  return suspend(async () => {
    const resp = await apolloClient.query({ query, variables });

    return resp.data;
  }, [key]);
}
