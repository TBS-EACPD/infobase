import _ from 'lodash';

import {
  convert_GET_with_compressed_query_to_POST,
  get_log_for_request,
} from './server_utils.js';

describe("convert_GET_with_compressed_query_to_POST", function(){
  it("Mutates a GET with a encoded-compressed-query header in to a standard POST with the query in its body", () => {
    const encoded_compressed_query = "I4VwpgTgngBAFAEgDYEMB2BzAXDAygFwgEtMBCAShgG8AoGGCAe0fzlUx2XQ0tvvoyMAbtTr96RACZjxAfVn4oABzBoUAWzAyYAX23zFKtZrF69AMiEpiKAEZIwAZwC8VAETsMbrG9VudQA=";

    const GET_with_compressed_query = {
      method: "GET",
      headers: {
        "encoded-compressed-query": encoded_compressed_query,
      },
    };

    const mutated_request_object = _.cloneDeep(GET_with_compressed_query);
    convert_GET_with_compressed_query_to_POST(mutated_request_object);

    const expected_POST = {
      method: "POST",
      headers: {
        "encoded-compressed-query": encoded_compressed_query,
      },
      body: { 
        query: "query ($lang: String!) {\n  root(lang: $lang) {\n    gov {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
        variables: '{"lang":"en"}',
        operationName: null,
      },
    };
    return expect(mutated_request_object).toEqual(expected_POST);
  });
});