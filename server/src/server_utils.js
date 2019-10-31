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

export const get_log_for_request = (req) => {
  const request_content = (!_.isEmpty(req.body) && req.body) || (!_.isEmpty(req.query) && req.query);
  const request_method = req.method === "POST" ? 
    ( _.has(req.headers, 'encoded-compressed-query') ? 
      "GET with encoded-compressed-query header, treated as POST" : 
      "POST"
    ) :
    req.method;
  
  const {_query_name, ...query_variables} = request_content.variables || {};

  return request_content && 
    `origin: ${
      req.headers.origin
    },\nrequest_method: ${
      request_method
    },\nquery_hash: ${ // Include a hash because the query itself can be longer than the (undocumented?) stackdriver textPayload limit
      md5(request_content.query)
    },\nquery_name: ${
      _query_name
    } ${
      !_.isEmpty(query_variables) ? 
        `,\nvariables: ${JSON.stringify(query_variables)}` : 
        ''
    },\nquery: ${ // put the query at the bottom of the textPayload so it doesn't push anything else out if its length causes a cut-off
      request_content.query
    }`
};

// I rewrote get_log_for_request, but I'm going to be a good TTDer for once and unit test the original before refactoring (kinda, since I DID already write the refactor)
//
//export const get_log_for_request = (req) => {
//  const request_content = (!_.isEmpty(req.body) && req.body) || (!_.isEmpty(req.query) && req.query);
//  const request_method = req.method === "POST" ? 
//    ( _.has(req.headers, 'encoded-compressed-query') ? 
//      "GET with encoded-compressed-query header, treated as POST" : 
//      "POST"
//    ) :
//    req.method;
//  
//  const {_query_name, ...variables} = request_content.variables || {};
//
//  const log_object = _.pickBy(
//    {
//      origin: req.headers.origin,
//      request_method,
//      non_query: !request_content && "Has no body or query string. Normally, this shouldn't happen",
//      query_hash: request_content && md5(request_content.query),
//      query_name: _query_name, 
//      variables,
//      query: request_content && request_content.query,
//    },
//    _.identity,
//  )
//
//  return JSON.stringify(log_object, null, 4);
//};