import {
  InMemoryCache,
  ApolloClient,
  graphql as apollo_connect,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

import _ from "lodash";
import { compressToBase64 } from "lz-string";
import React from "react";

import string_hash from "string-hash";

import { log_standard_event } from "src/core/analytics.js";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace.js";
import {
  sha,
  local_ip,
  is_dev,
  is_ci,
} from "src/core/injected_build_constants.js";

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

// Makes our GET requests tolerant of long queries, sufficient but may not work for arbitrarily long queries
export const query_length_tolerant_fetch = async (uri, options) => {
  // important, this regex lazy matches up to and including FIRST ? occurence, which (in a URI)
  // should be where the query string starts. I've complicated it slightly just in case there's ever a ? IN
  // the query string (well, that'd be an encoding error anyway)
  // const url_encoded_query = uri.replace(/^(.*?)\?/, "");

  // const query_string_hash = string_hash(url_encoded_query);

  // const short_uri = `${await get_api_url()}?v=${sha}&queryHash=${query_string_hash}`;
  const short_uri = `${await get_api_url()}?v=${sha}`;

  const new_options = {
    ...options,
    headers: {
      ...options.headers,
      // "encoded-compressed-query": compressToBase64(
      //   decodeURIComponent(url_encoded_query)
      // ),
    },
  };

  return fetch(short_uri, new_options);
};

let client = null;
export function get_client() {
  if (!client) {
    client = new ApolloClient({
      link: new BatchHttpLink({
        uri: prod_api_url, // query_length_tolerant_fetch replaces the uri on the fly, switches to appropriate local uri in dev
        fetchOptions: { method: "POST" },
        fetch: query_length_tolerant_fetch,
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

export const query_logging_wrapper = (
  query_name,
  query,
  expect_resolved_response = true
) => (variables) => {
  const time_at_request = Date.now();
  return query({ ...variables, _query_name: query_name })
    .then((resolved_response) => {
      const resp_time = Date.now() - time_at_request;
      if (!expect_resolved_response || !_.isEmpty(resolved_response)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `${query_name}, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `${query_name}, took ${resp_time} ms`,
        });
      }

      return resolved_response;
    })
    .catch((error) => {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `${query_name}, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

const InnerLoadingHoc = ({ Component, data_to_props }) => (props) => {
  if (props.data.loading) {
    return <div> Loading ... </div>;
  } else {
    return (
      <Component
        data={data_to_props(props.data)}
        gql_props={{
          refetch: props.data.refetch,
          variables: props.data.variables,
        }}
      />
    );
  }
};

//for use in development only
export const LoadingHoc = ({
  Component,
  query,
  data_to_props = _.identity,
  variables,
}) =>
  apollo_connect(query, {
    options: variables ? { variables } : {},
  })(InnerLoadingHoc({ Component, data_to_props }));

assign_to_dev_helper_namespace({
  query_api: (query) => client.query({ query }),
});
