import _ from "lodash";
import md5 from "md5";

const quiet_failing_json_parse = (json_string) => {
  try {
    return JSON.parse(json_string);
  } catch (error) {
    return {};
  }
};

// Side effect alert: this function mutates the suplied request object so that the conversion persists to subsequent server midleware
// ... bit of a hack, and I'm not just talking about a function having side effects
export const convert_GET_with_query_to_POST = (req) => {
  const query = req.headers["gql-query"];
  req.method = "POST";
  req.body = JSON.parse(query);
};

const get_query_details_from_entry = (entry) => {
  const { query, variables } = entry;
  if (!variables) {
    return { query, variables };
  }
  const { _query_name, ...actual_query_variables } = variables;
  return { query, _query_name, variables: actual_query_variables };
};
const get_query_and_variables_from_request = (req) => {
  if (_.isArray(req.body)) {
    return req.body.map(get_query_details_from_entry);
  }
  if (!_.isEmpty(req.body)) {
    return [get_query_details_from_entry(req.body)];
  }
  if (req.query) {
    let { query, variables } = req.query;

    variables = quiet_failing_json_parse(variables);
    const { _query_name, ...actual_query_variables } = variables;

    return [
      {
        query,
        variables: actual_query_variables,
        _query_name: _query_name,
      },
    ];
  }
  return [{}];
};
export const get_log_objects_for_request = (req) => {
  const queries = get_query_and_variables_from_request(req);

  const method =
    req.method === "POST"
      ? _.has(req.headers, "gql-query")
        ? "GET with gql-query header, treated as POST"
        : "POST"
      : req.method;

  const batch_hash = queries.length ? md5(JSON.stringify(queries)) : "";
  return queries.map(({ query, variables, _query_name }) => {
    return _.pickBy(
      {
        origin: req.headers && req.headers.origin,
        method,
        non_query:
          !query &&
          "Apparently not a GraphQL query! Normally, this shouldn't happen!",
        batch_hash,
        _query_name: _query_name,
        variables,
        // NOTE: query needs to be the last field here. There's a size limit per log item, and query is the field most
        // capable of pushing the log over the limit (afterwhich it truncates). In the truncation case, the query hash
        // at least gives some opportunity to still properly identify the query
        query: query,
      },
      _.identity
    );
  });
};
