import type { NormalizedCacheObject } from "@apollo/client";
import { InMemoryCache, ApolloClient, useQuery } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http/index";
import type { DocumentNode } from "graphql";
import _ from "lodash";
import string_hash from "string-hash";
import { suspend } from "suspend-react";

import {
  sha,
  local_ip,
  is_dev,
  is_ci,
} from "src/core/injected_build_constants";

import { make_request } from "src/request_utils";

const prod_api_url = `https://us-central1-ib-serverless-api-prod.cloudfunctions.net/prod-api-${sha}/graphql`;

const poke_server = (
  api_url: string,
  fetch_options?: RequestInit,
  query_name = "poke_server"
) =>
  make_request(
    `${api_url}?query={ root(lang: "en") { non_field } }&query_name=${query_name}`,
    { retries: 0, fetch_options: { cache: "no-cache", ...fetch_options } }
  );

const get_api_url = _.memoize(async () => {
  if (is_ci) {
    return `hacky_target_text_for_ci_to_replace_with_test_and_deploy_time_api_urls`;
  } else if (is_dev) {
    const local_dev_api_url = `http://${local_ip}:1337/graphql`;

    // Need to be careful if the local IP's changed since the local_ip env var was last set (last time
    // webpack process was restarted), if it has then it will fail as an API URL.
    // Fall back to using local host in that case. Only give the query 1 second to respond before going to fallback.
    // Can't just always use local host though, or else we can't locally serve dev builds to other devices
    const controller = new AbortController();
    const id_for_test_timeout = setTimeout(() => controller.abort(), 1000);
    return await poke_server(
      local_dev_api_url,
      { signal: controller.signal },
      "dev_connection_test"
    )
      .then((_response) => {
        clearTimeout(id_for_test_timeout);
        return local_dev_api_url;
      })
      .catch((_error) => {
        clearTimeout(id_for_test_timeout);
        return "http://127.0.0.1:1337/graphql";
      });
  } else {
    return prod_api_url;
  }
});

export const wake_up_graphql_cloud_function = () =>
  get_api_url()
    .then((api_url) => poke_server(api_url))
    .catch(_.noop);

const query_as_get_with_query_header = async (
  _uri: string,
  options: RequestInit
) => {
  // want GET requests for client side caching (safe to do given our cache busting scheme and read-only GraphQL API)
  // due to GET query param length limits, do this by moving the actual query/batched queries to the request header "gql-query",
  // which our server is configured to specially handle

  const query = options.body?.toString();

  if (typeof query === "undefined") {
    throw new Error("TODO");
  }

  const query_hash = string_hash(query);

  const uriWithVersionAndQueryHash = `${await get_api_url()}?v=${sha}&queryHash=${query_hash}`;

  const new_options = {
    ...options,
    method: "GET",
    body: undefined,
    headers: {
      ...options.headers,
      "uri-encoded-gql-query": encodeURIComponent(query),
    },
  };

  const query_names = _.chain(JSON.parse(query))
    .map("variables._query_name")
    .join(", ")
    .value();

  return make_request(uriWithVersionAndQueryHash, {
    log_identifier: `${query_hash}: [${query_names}]`,
    success_log_status: "API_QUERY_SUCCESS",
    error_log_status: "API_QUERY_FAILURE",
    fetch_options: new_options,
  });
};

let client: undefined | ApolloClient<NormalizedCacheObject> = undefined;
export function get_client() {
  if (typeof client === "undefined") {
    client = new ApolloClient({
      link: new BatchHttpLink({
        // query_as_get_with_query_header replaces the uri on the fly, switches to appropriate local uri in dev
        uri: prod_api_url,
        // the fetchOptions method is overridden to GET by query_as_get_with_query_header for caching, but need BatchHttpLink
        // to think we're using POST for the batching behaviour we want
        fetchOptions: {
          method: "POST",
        },
        fetch: query_as_get_with_query_header,
      }),
      cache: new InMemoryCache({
        typePolicies: {
          Root: {
            keyFields: [],
          },
        },
      }),
      defaultOptions: {
        query: {
          fetchPolicy: "cache-first",
        },
      },
    });
  }
  return client;
}

export const query_factory = <
  Query,
  Variables,
  Resolver extends (response: Query) => any
>({
  query_name,
  query,
  resolver,
}: {
  query_name: string;
  query: DocumentNode;
  resolver?: Resolver;
}) => {
  if (!query_name) {
    throw new Error(
      "All queries must have (unique) names, for logging purposes."
    );
  }

  const resolver_or_identity =
    typeof resolver === "undefined" ? (response: Query) => response : resolver;

  const promise_key = `query_${query_name}`;
  const promise_query = (variables: Variables) => {
    return get_client()
      .query<Query, Variables>({
        query: query,
        variables: {
          ...variables,
          _query_name: query_name,
        },
      })
      .then(({ data }) => resolver_or_identity(data));
  };

  const suspended_key = _.chain(query_name)
    .camelCase()
    .upperFirst()
    .thru((pascal_case_name) => `suspended${pascal_case_name}`)
    .value();
  const suspendedQuery = (variables: Variables): Query => {
    const key = query_name + JSON.stringify(variables);
    return suspend(() => promise_query(variables), [key]);
  };

  const hook_key = _.chain(query_name)
    .camelCase()
    .upperFirst()
    .thru((pascal_case_name) => `use${pascal_case_name}`)
    .value();
  const useHookQuery = (variables: Variables) => {
    const { loading, error, data } = useQuery<Query, Variables>(query, {
      variables: {
        ...variables,
        _query_name: query_name,
      },
    });

    if (loading) {
      return {
        loading,
        error,
        data,
      };
    } else if (error) {
      throw new Error(JSON.stringify(error));
    } else if (typeof data === "undefined") {
      throw new Error(
        `query_name: ${query_name}, unexpected undefined data result from useQuery in a non-loading and non-error state.`
      );
    } else {
      return {
        loading,
        error,
        data: resolver_or_identity(data),
      };
    }
  };

  return {
    [promise_key]: promise_query,
    [suspended_key]: suspendedQuery,
    [hook_key]: useHookQuery,
  };
};