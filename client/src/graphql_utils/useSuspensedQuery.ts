import type { DocumentNode } from "graphql";

import type { UseQueryResult } from "react-query";
import { useQuery } from "react-query";

import { get_client } from "./graphql_utils";

export function useSuspensedQuery<Query, Variables>(
  query: DocumentNode,
  variables?: Variables
): UseQueryResult<Query> {
  const apolloClient = get_client();
  const key = query?.loc?.source?.body + JSON.stringify(variables);

  return useQuery(
    key,
    async () => {
      const resp = await apolloClient.query({ query, variables });
      return resp.data;
    },
    { retry: false }
  );
}
