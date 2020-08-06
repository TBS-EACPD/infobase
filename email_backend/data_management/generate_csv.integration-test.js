import _ from "lodash";
import axios from "axios";
import { get_output } from "./generate_csv";
import { connect_db } from "../src/db_utils/connect_db";
import { make_mongoose_model_from_original_template } from "../src/db_utils/log_email_and_meta_to_db";
import { get_templates } from "../src/template_utils";
import fs from "fs";

//Make sure there is test data to work with
const test_template_name = "test_template.test";
const completed_test_template = {
  enums: ["bug", "other"],
  radio: ["yes"],
  text: "a",
  number: 1,
  json: { bleh: "bleh", a: 1 },

  required_automatic: "blah",
  optional_automatic: "bluh",
};

const instance = axios.create({
  headers: {
    referer: "http://localhost:8080/build/InfoBase/index-eng.html",
  },
});
let csv, json, csv_title;

beforeAll((done) => {
  instance
    .post("http://127.0.0.1:7331/submit_email", {
      template_name: test_template_name,
      completed_template: completed_test_template,
    })
    .then(() => {
      get_output().then(({ csv_name, json_output }) => {
        json = json_output;
        fs.readFile(__dirname + `/CSVs/${csv_name}`, "utf-8", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            csv_title = csv_name;
            csv = data;
            done();
          }
        });
      });
    });
});

afterAll((done) => {
  const template = get_templates()[test_template_name];
  connect_db().then(() => {
    make_mongoose_model_from_original_template({
      original_template: template,
      template_name: test_template_name,
    })
      .collection.drop()
      .then(() => {
        fs.unlinkSync(__dirname + `/CSVs/${csv_title}`);
        done();
      });
  });
});

describe("Check that CSV output and JSON output are correct", () => {
  it("Snapshot of JSON output", () => {
    expect(json).toMatchSnapshot({
      _id: expect.any(Object),
      a: 1,
      bleh: "bleh",
      date: expect.any(String),
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

  it("Testing CSV for data", () => {
    expect(csv.split("\n").length).toBe(2);
  });
});
