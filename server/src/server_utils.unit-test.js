import _ from "lodash";

import {
  convert_GET_with_query_to_POST,
  get_log_objects_for_request,
} from "./server_utils.js";

const query =
  "query ($lang: String!) {\n  root(lang: $lang) {\n    gov {\n      id\n      __typename\n    }\n    __typename\n  }\n}";
const variables_val = { lang: "en", _query_name: "test" };
const variable_string = JSON.stringify(variables_val);
const query_object = [{ query, variables: variable_string }];

describe("convert_GET_with_query_to_POST", function () {
  it("Mutates a GET with an gql-query header in to a standard POST with the query in its body", () => {
    const GET_with_compressed_query = {
      method: "GET",
      headers: {
        "gql-query": JSON.stringify(query_object),
      },
    };

    const mutated_request_object = _.cloneDeep(GET_with_compressed_query);
    convert_GET_with_query_to_POST(mutated_request_object);

    const expected_POST = {
      method: "POST",
      headers: {
        "gql-query": JSON.stringify(query_object),
      },
      body: [
        {
          query,
          variables: variable_string,
        },
      ],
    };
    expect(mutated_request_object).toEqual(expected_POST);
  });
});

describe("get_log_objects_for_request", function () {
  it("Builds log as expected for a normal GET request with variables", () => {
    const GET_request = {
      method: "GET",
      headers: {
        origin: "test",
      },
      query: query_object[0],
    };

    const log_object = get_log_objects_for_request(GET_request)[0];

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("GET");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.batch_hash).toEqual(expect.stringMatching(/.?/));
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

    const log_object = get_log_objects_for_request(GET_request)[0];

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("GET");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual(undefined);
    expect(log_object.variables).toEqual({});
    expect(log_object.batch_hash).toEqual(expect.stringMatching(/.?/));
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
        variables: variables_val,
      },
    };

    const log_object = get_log_objects_for_request(POST_request)[0];

    expect(log_object.origin).toEqual("test");
    expect(log_object.method).toEqual("POST");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.batch_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);
  });

  it("Builds log as expected for a batched POST request", () => {
    const query2 =
      "query ($lang: String!) {\n  root(lang: $lang) {\n    non_field {\n      id\n      __typename\n    }\n    __typename\n  }\n}";

    const POST_request = {
      method: "POST",
      headers: {
        origin: "test",
      },
      body: [
        { query, variables: variables_val },
        {
          query: query2,
          variables: { lang: "fr", _query_name: "test2" },
        },
      ],
    };

    const [log_object1, log_object2] =
      get_log_objects_for_request(POST_request);

    expect(log_object1.origin).toEqual("test");
    expect(log_object1.method).toEqual("POST");
    expect(log_object1.non_query).toEqual(undefined);
    expect(log_object1._query_name).toEqual("test");
    expect(log_object1.variables).toEqual({ lang: "en" });
    expect(log_object1.batch_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object1.query).toEqual(query);

    //now test log object 2
    expect(log_object2.origin).toEqual("test");
    expect(log_object2.method).toEqual("POST");
    expect(log_object2.non_query).toEqual(undefined);
    expect(log_object2._query_name).toEqual("test2");
    expect(log_object2.variables).toEqual({ lang: "fr" });
    expect(log_object2.batch_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object2.query).toEqual(query2);
  });

  it("Identifies non-query requests as such", () => {
    const non_query_request_with_body = {
      method: "POST",
      body: { anything_but_a_query: "yup" },
    };
    const non_query_request_no_body = {
      method: "POST",
    };

    const log_object_body = get_log_objects_for_request(
      non_query_request_with_body
    )[0];
    const log_object_no_body = get_log_objects_for_request(
      non_query_request_no_body
    )[0];

    expect(log_object_body.non_query).toEqual(expect.stringMatching(/.?/));
    expect(log_object_no_body.non_query).toEqual(expect.stringMatching(/.?/));
  });

  it("Integration: GET requests converted to POST requests generate log objects as expected", () => {
    const GET_with_compressed_query = {
      method: "GET",
      headers: {
        "gql-query": JSON.stringify({
          query,
          variables: variables_val,
        }),
        origin: "test",
      },
    };

    const mutated_request_object = _.cloneDeep(GET_with_compressed_query);
    convert_GET_with_query_to_POST(mutated_request_object);

    const log_object = get_log_objects_for_request(mutated_request_object)[0];

    expect(log_object.origin).toEqual("test");
    expect(log_object.non_query).toEqual(undefined);
    expect(log_object._query_name).toEqual("test");
    expect(log_object.variables).toEqual({ lang: "en" });
    expect(log_object.batch_hash).toEqual(expect.stringMatching(/.?/));
    expect(log_object.query).toEqual(query);

    // should be the only difference between this and the regular POST case
    expect(log_object.method).toEqual(
      "GET with gql-query header, treated as POST"
    );
  });
});
