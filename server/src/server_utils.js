import { decompressFromBase64 } from "lz-string";
import { decode } from "querystring";
import md5 from "md5";

import _ from "lodash";

const quiet_failing_json_parse = (json_string) => {
  try {
    return JSON.parse(json_string);
  } catch (error) {
    return {};
  }
};

// Side effect alert: this function mutates the suplied request object so that the conversion persists to subsequent server midleware
// ... bit of a hack, and I'm not just talking about a function having side effects
export const convert_GET_with_compressed_query_to_POST = (req) => {
  const decompressed_query = decompressFromBase64(
    req.headers["encoded-compressed-query"]
  );
  const { query, variables } = decode(decompressed_query);

  req.method = "POST";
  req.body = {
    query,
    variables: quiet_failing_json_parse(variables),
    operationName: null,
  };
};

const get_query_and_variables_from_request = (req) => {
  const { query, variables } = (() => {
    if (!_.isEmpty(req.body)) {
      const { query, variables } = req.body;
      return { query, variables };
    } else if (req.query) {
      const { query, variables } = req.query;

      const confirmed_query = /^query/.test(query) && query;

      return {
        query: confirmed_query,
        variables: quiet_failing_json_parse(variables),
      };
    } else {
      return {};
    }
  })();

  const { _query_name, ...actual_query_variables } = variables || {};

  return { query, _query_name, variables: actual_query_variables };
};
export const get_log_object_for_request = (req) => {
  const {
    query,
    _query_name,
    variables,
  } = get_query_and_variables_from_request(req);

  const method =
    req.method === "POST"
      ? _.has(req.headers, "encoded-compressed-query")
        ? "GET with encoded-compressed-query header, treated as POST"
        : "POST"
      : req.method;

  // NOTE: query needs to be the last field here. There's a size limit per log item, and query is the field most
  // capable of pushing the log over the limit (afterwhich it truncates). In the truncation case, the query hash
  // at least gives some opportunity to still properly identify the query
  return _.pickBy(
    {
      origin: req.headers && req.headers.origin,
      method,
      non_query:
        !query &&
        "Apparently not a GraphQL query! Normally, this shouldn't happen!",
      _query_name,
      variables,
      query_hash: query && md5(query),
      query,
    },
    _.identity
  );
};
