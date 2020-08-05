import _ from "lodash";
import axios from "axios";
import { get_output } from "./generate_csv";

//Make sure there is test data to work with
const test_template_name = "test_template.test";
const completed_test_template = {
  enums: ["bug", "other"],
  radio: ["yes"],
  text: "a",
  number: 2,
  json: { bleh: "bleh", a: 2 },

  required_automatic: "blah",
  optional_automatic: "bluh",
};

const instance = axios.create({
  headers: {
    referer: "http://localhost:8080/build/InfoBase/index-eng.html",
  },
});
let csv, json;

beforeAll((done) => {
  instance
    .post("http://127.0.0.1:7331/submit_email", {
      template_name: test_template_name,
      completed_template: completed_test_template,
    })
    .then(() => {
      get_output().then(({ csv_output, json_output }) => {
        csv = csv_output;
        json = json_output;
        done();
      });
    });
});

afterAll((done) => {});

describe("Check that CSV output and JSON output are correct", () => {
  it.only("Snapshot of JSON output", () => {
    expect(json).toMatchSnapshot({
      _id: expect.any(Object),
      a: 1,
      bleh: "bleh",
      enums: "bug, other",
      from: "Sender Name <sender@example.com>",
      number: 1,
      optional_automatic: "bluh",
      radio: "yes",
      referer: "http://localhost:8080/build/InfoBase/index-eng.html",
      required_automatic: "blah",
      server_time: expect.any(String),
      text: "a",
      time: expect.any(String),
      to: "Recipient <recipient@example.com>",
    });
  });
});
