import { decompressFromBase64 } from 'lz-string';
import md5 from 'md5';

import _ from 'lodash';

// Side effect alert: this function mutates the suplied request object so that the conversion persists to subsequent server midleware
// ... bit of a hack, and I'm not just talking about a function having side effects
export const convert_GET_with_compressed_query_to_POST = (req) => {
  const decoded_decompressed_query = decompressFromBase64(req.headers['encoded-compressed-query']);
  const [query, variables] = decoded_decompressed_query.split("&variables=");

  req.method = "POST";
  req.body = {
    query,
    variables,
    operationName: null,
  };
};

const get_query_and_variables_from_request = (req) => {
  if ( !_.isEmpty(req.body) ){
    const {query, variables} = req.body;
    return {query, variables};
  } else if( req.query ){
    const [query, variables_string] = req.query.includes("&variables=") ?
      req.query.split("&variables=") :
      [req.query, ""];

    const confirmed_query = /^query/.test(query) && query

    const variables = variables_string && JSON.parse(variables_string);

    return {query: confirmed_query, variables};
  } else {
    return {};
  }
};
export const get_log_object_for_request = (req) => {
  const {query, variables} = get_query_and_variables_from_request(req);
  const {_query_name, ...query_variables} = variables || {};

  const method = req.method === "POST" ? 
    ( _.has(req.headers, 'encoded-compressed-query') ? 
      "GET with encoded-compressed-query header, treated as POST" : 
      "POST"
    ) :
    req.method;

  return _.pickBy(
    {
      origin: req.headers && req.headers.origin,
      method,
      non_query: !query && "Apparently not a GraphQL query! Normally, this shouldn't happen!",
      query_name: _query_name, 
      variables: query_variables,
      query_hash: query && md5(query),
      query,
    },
    _.identity,
  )
};