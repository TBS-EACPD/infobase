import _ from 'lodash';

import {
  convert_GET_with_compressed_query_to_POST,
  get_log_object_for_request,
} from './server_utils.js';


const query_string = 'query ($lang: String!) {\n  root(lang: $lang) {\n    gov {\n      id\n      __typename\n    }\n    __typename\n  }\n}';
const variable_string = '{"lang":"en","_query_name":"test"}';
const uncompressed_query = `${query_string}&variables=${variable_string}`;
const compressed_query = "I4VwpgTgngBAFAEgDYEMB2BzAXDAygFwgEtMBCAShgG8AoGGCAe0fzlUx2XQ0tvvoyMAbtTr96RACZjxAfVn4oABzBoUAWzAyYAX23zFKtZrF6dAMiEpiKAEZIwAZwC8VAETsMbrG9VuANG6yoJBQssZg3m74TvhuOkA";


describe("convert_GET_with_compressed_query_to_POST", function(){
  it("Mutates a GET with an encoded-compressed-query header in to a standard POST with the uncompressed query in its body", () => {
    const GET_with_compressed_query = {
      method: "GET",
      headers: {
        "encoded-compressed-query": compressed_query,
      },
    };

    const mutated_request_object = _.cloneDeep(GET_with_compressed_query);
    convert_GET_with_compressed_query_to_POST(mutated_request_object);

    const expected_POST = {
      method: "POST",
      headers: {
        "encoded-compressed-query": compressed_query,
      },
      body: { 
        query: query_string,
        variables: variable_string,
        operationName: null,
      },
    };
    expect(mutated_request_object).toEqual(expected_POST);
  });
});


describe("get_log_object_for_request", function(){
  it("Builds log as expected for a normal GET request", () => {
    const GET_request = {
      method: "GET",
      headers: {
        origin: "test",
      },
      query: uncompressed_query,
    };

    const log_object = get_log_object_for_request(GET_request);

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("GET");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object.query_name).toEqual("test");
    expect(log_object.variables).toEqual({lang: "en"});
    expect(log_object.query_hash).toEqual( expect.stringMatching(/.?/) );
    expect(log_object.query).toEqual(query_string);
  });

  it("Builds log as expected for a normal POST request", () => {
    const POST_request = {
      method: "POST",
      headers: {
        origin: "test",
      },
      body: {
        query: query_string,
        variables: JSON.parse(variable_string),
      },
    };

    const log_object = get_log_object_for_request(POST_request);

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("POST");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object.query_name).toEqual("test");
    expect(log_object.variables).toEqual({lang: "en"});
    expect(log_object.query_hash).toEqual( expect.stringMatching(/.?/) );
    expect(log_object.query).toEqual(query_string);
  });

  it("Builds log as expected for a GET request with encoded-compressed-query that has been converted to a POST", () => {
    const POST_converted_from_GET_with_compressed_query = {
      method: "POST",
      headers: {
        origin: "test",
        "encoded-compressed-query": "sdfsdfas",
      },
      body: {
        query: query_string,
        variables: JSON.parse(variable_string),
      },
    };

    const log_object = get_log_object_for_request(POST_converted_from_GET_with_compressed_query);

    // only the one difference between this and the regular POST case
    expect(log_object.method).toEqual("GET with encoded-compressed-query header, treated as POST");
  });

  it("Identifies non-query requests as such", () => {
    const non_query_request_with_body = {
      method: "POST",
      body: { anything_but_a_query: "yup" },
    };
    const non_query_request_no_body = {
      method: "POST",
    };

    const log_object_body = get_log_object_for_request(non_query_request_with_body);
    const log_object_no_body = get_log_object_for_request(non_query_request_no_body);

    expect(log_object_body.non_query).toEqual( expect.stringMatching(/.?/) );
    expect(log_object_no_body.non_query).toEqual( expect.stringMatching(/.?/) );
  });
});