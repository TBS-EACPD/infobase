import { InMemoryCache, ApolloClient, useQuery } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http/index";
import _ from "lodash";

import string_hash from "string-hash";

import {
  sha,
  local_ip,
  is_dev,
  is_ci,
} from "src/core/injected_build_constants";

import { make_request } from "src/request_utils";

const prod_api_url = `https://us-central1-ib-serverless-api-prod.cloudfunctions.net/prod-api-${sha}/graphql`;

const poke_server = (api_url, fetch_options, query_name = "poke_server") =>
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
      .then((response) => {
        clearTimeout(id_for_test_timeout);
        return local_dev_api_url;
      })
      .catch((error) => {
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

const query_as_get_with_query_header = async (uri, options) => {
  // want GET requests for client side caching (safe to do given our cache busting scheme and read-only GraphQL API)
  // due to GET query param length limits, do this by moving the actual query/batched queries to the request header "gql-query",
  // which our server is configured to specially handle

  const query = options.body;
  const query_hash = string_hash(query);

  const uriWithVersionAndQueryHash = `${await get_api_url()}?v=${sha}&queryHash=${query_hash}`;

  const new_options = {
    ...options,
    method: "GET",
    body: undefined,
    headers: {
      ...options.headers,
      "gql-query": query,
    },
  };

  const query_names = _.chain(query)
    .thru(JSON.parse)
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

let client = null;
export function get_client() {
  if (!client) {
    client = new ApolloClient({
      link: new BatchHttpLink({
        // query_as_get_with_query_header replaces the uri on the fly, switches to appropriate local uri in dev
        uri: prod_api_url,
        // the fetchOptions method is overridden to GET by query_as_get_with_query_header for caching, but need BatchHttpLink
        // to think we're using POST for the batching behaviour we want
        fetchOptions: { method: "POST" },
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

const query_promise_factory = (query_name, query, resolver) => (variables) => {
  return get_client()
    .query({
      query: query,
      variables: {
        ...variables,
        _query_name: query_name,
      },
    })
    .then(({ data }) => resolver(data));
};

const query_hook_factory = (query_name, query, resolver) => (variables) => {
  const { loading, error, data } = useQuery(query, {
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
    throw new Error(error);
  } else {
    return {
      loading,
      error,
      data: resolver(data),
    };
  }
};

export const query_factory = ({ query_name, query, resolver = _.identity }) => {
  if (!query_name) {
    throw new Error(
      "All queries must have (unique) names, for logging purposes."
    );
  }

  const promise_key = `query_${query_name}`;

  const hook_key = _.chain(query_name)
    .camelCase()
    .upperFirst()
    .thru((pascal_case_name) => `use${pascal_case_name}`)
    .value();

  return {
    [promise_key]: query_promise_factory(query_name, query, resolver),
    [hook_key]: query_hook_factory(query_name, query, resolver),
  };
};
