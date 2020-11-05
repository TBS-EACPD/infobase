import { encode } from "querystring";

import _ from "lodash";

import { compressToBase64 } from "lz-string";

import {
  convert_GET_with_compressed_query_to_POST,
  get_log_object_for_request,
} from "./server_utils.js";

const query =
  "query ($lang: String!) {\n  root(lang: $lang) {\n    gov {\n      id\n      __typename\n    }\n    __typename\n  }\n}";
const variable_string = '{"lang":"en","_query_name":"test"}';
const query_object = { query, variables: variable_string };

const url_encoded_query = encode(query_object);
const compressed_query = compressToBase64(url_encoded_query);

describe("convert_GET_with_compressed_query_to_POST", function () {
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
        query,
        variables: JSON.parse(variable_string),
        operationName: null,
      },
    };
    expect(mutated_request_object).toEqual(expected_POST);
  });
});

describe("get_log_object_for_request", function () {
  it("Builds log as expected for a normal GET request with variables", () => {
    const GET_request = {
      method: "GET",
      headers: {
        origin: "test",
      },
      query: query_object,
    };

    const log_object = get_log_object_for_request(GET_request);

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("GET");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.query_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);
  });

  it("Builds log as expected for a normal GET request without variables", () => {
    const GET_request = {
      method: "GET",
      headers: {
        origin: "test",
      },
      query: { query },
    };

    const log_object = get_log_object_for_request(GET_request);

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("GET");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual(undefined);
    expect(log_object.variables).toEqual({});
    expect(log_object.query_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);
  });

  it("Builds log as expected for a normal POST request", () => {
    const POST_request = {
      method: "POST",
      headers: {
        origin: "test",
      },
      body: {
        query,
        variables: JSON.parse(variable_string),
      },
    };

    const log_object = get_log_object_for_request(POST_request);

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("POST");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.query_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);
  });

  it("Identifies non-query requests as such", () => {
    const non_query_request_with_body = {
      method: "POST",
      body: { anything_but_a_query: "yup" },
    };
    const non_query_request_no_body = {
      method: "POST",
    };

    const log_object_body = get_log_object_for_request(
      non_query_request_with_body
    );
    const log_object_no_body = get_log_object_for_request(
      non_query_request_no_body
    );

    expect(log_object_body.non_query).toEqual(expect.stringMatching(/.?/));
    expect(log_object_no_body.non_query).toEqual(expect.stringMatching(/.?/));
  });

  it("Integration: GET requests converted to POST requests generate log objects as expected", () => {
    const GET_with_compressed_query = {
      method: "GET",
      headers: {
        "encoded-compressed-query": compressed_query,
        origin: "test",
      },
    };

    const mutated_request_object = _.cloneDeep(GET_with_compressed_query);
    convert_GET_with_compressed_query_to_POST(mutated_request_object);

    const log_object = get_log_object_for_request(mutated_request_object);

    expect(log_object.origin).toEqual("test");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.query_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);

    // should be the only difference between this and the regular POST case
    expect(log_object.method).toEqual(
      "GET with encoded-compressed-query header, treated as POST"
    );
  });
});
