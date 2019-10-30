import { decompressFromBase64 } from 'lz-string';
import md5 from 'md5';

export const convert_get_with_compressed_query_to_post_request = (req) => {
  const decoded_decompressed_query = decompressFromBase64(req.headers['encoded-compressed-query']);
  const [query, mixed_variables] = decoded_decompressed_query.split("&variables=");
  
  // Client should be throwing an additional variable, _query_name, in with the actual variables. Grab that out
  const { _query_name, ...query_variables } = JSON.parse(mixed_variables);

  req.method = "POST";
  req.body = {
    query_name: _query_name,
    query,
    variables: query_variables,
    operationName: null,
  };
};

export const log_query = (req) => {
  const request_content = (!_.isEmpty(req.body) && req.body) || (!_.isEmpty(req.query) && req.query);
  const request_method = req.method === "POST" ? 
    ( _.has(req.headers, 'encoded-compressed-query') ? 
      "GET with encoded-compressed-query header, treated as POST" : 
      "POST"
    ) :
    req.method;
  
  request_content && 
    console.log( /* eslint-disable-line no-console */
      `origin: ${
        req.headers.origin
      } \nrequest_method: ${
        request_method
      } \nquery_name: ${
        request_content.query_name
      } ${
        !_.isEmpty(request_content.variables) ? 
          `\nvariables: ${JSON.stringify(request_content.variables)}` : 
          ''
      } \nquery_hash: ${ // Include a hash because the query itself can be longer than the (undocumented?) stackdriver textPayload limit
        md5(request_content.query)
      } \nquery: ${ // put the query at the bottom of the textPayload so it doesn't push anything else out if its length causes a cut-off
        request_content.query
      }`
    );
};