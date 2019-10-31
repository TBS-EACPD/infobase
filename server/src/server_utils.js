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
  } else if( !_.isEmpty(req.query) ){
    const [query, variables_string] = query.split("&variables=");

    return {query, variables: JSON.parse(variables_string)};
  } else {
    return {};
  }
};
export const get_log_object_for_request = (req) => {
  const {query, variables} = get_query_and_variables_from_request(req);
  const {_query_name, ...query_variables} = variables || {};

  const request_method = req.method === "POST" ? 
    ( _.has(req.headers, 'encoded-compressed-query') ? 
      "GET with encoded-compressed-query header, treated as POST" : 
      "POST"
    ) :
    req.method;

  return _.pickBy(
    {
      origin: req.headers.origin,
      request_method,
      non_query: !query && "Has no query. Normally, this shouldn't happen!",
      query_name: _query_name, 
      query_hash: md5(query),
      variables: query_variables,
      query,
    },
    _.identity,
  )
};