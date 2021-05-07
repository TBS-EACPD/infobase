import { InMemoryCache, ApolloClient, useQuery } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http/index.js";

import _ from "lodash";
import { useState } from "react";

import string_hash from "string-hash";

import { log_standard_event } from "src/core/analytics.js";

import {
  sha,
  local_ip,
  is_dev,
  is_ci,
} from "src/core/injected_build_constants.ts";

const prod_api_url = `https://us-central1-ib-serverless-api-prod.cloudfunctions.net/prod-api-${sha}/graphql`;

export const get_api_url = async () => {
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
    return await fetch(
      `${local_dev_api_url}?query={ root(lang: "en") { non_field } }&query_name=dev_connection_test`,
      { signal: controller.signal }
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
};

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

  return fetch(uriWithVersionAndQueryHash, new_options).catch((error) => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "API_CONNECTION_ERROR",
      MISC2: error.toString(),
    });

    throw error;
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

const log_query_success = (query_name, response_time) =>
  log_standard_event({
    SUBAPP: window.location.hash.replace("#", ""),
    MISC1: "API_QUERY_SUCCESS",
    MISC2: `${query_name}, took ${response_time} ms`,
  });
const log_query_failure = (query_name, response_time, error) =>
  log_standard_event({
    SUBAPP: window.location.hash.replace("#", ""),
    MISC1: "API_QUERY_FAILURE",
    MISC2: `${query_name}, took ${response_time} ms - ${error.toString()}`,
  });

const query_promise_factory = (query_name, query, resolver) => (variables) => {
  const time_at_request = Date.now();

  return get_client()
    .query({
      query: query,
      variables: {
        ...variables,
        _query_name: query_name,
      },
    })
    .then((response) => {
      log_query_success(query_name, Date.now() - time_at_request);

      return resolver(response);
    })
    .catch((error) => {
      log_query_failure(query_name, Date.now() - time_at_request, error);

      throw error;
    });
};

const query_hook_factory = (query_name, query, resolver) => (variables) => {
  const [time_at_request, set_time_at_request] = useState(Date.now()); // eslint-disable-line no-unused-vars

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
    log_query_failure(query_name, Date.now() - time_at_request, error);

    throw new Error(error);
  } else {
    log_query_success(query_name, Date.now() - time_at_request);

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
