import type { DocumentNode } from "graphql";
import { suspend } from "suspend-react";

import { get_client } from "./graphql_utils";

export async function getQuery<Query, Variables>(
  query: DocumentNode,
  variables?: Variables
): Promise<Query> {
  const apolloClient = get_client();
  const resp = await apolloClient.query({ query, variables });

  return resp.data;
}

export function getSuspensedQuery<Query, Variables>(
  query: DocumentNode,
  variables?: Variables
): Query {
  const key = query?.loc?.source?.body + JSON.stringify(variables);

  return suspend(async () => {
    return getQuery<Query, Variables>(query, variables);
  }, [key]);
}
