import _ from "lodash";
import mongoose from "mongoose";

import { connect_db } from "../../src/db_utils/connect_db";
import { make_mongoose_model_from_original_template } from "../../src/db_utils/log_email_and_meta_to_db";
import { get_templates } from "../../src/template_utils";

import { get_csv_strings } from "./generate_csv";

//Make sure there is test data to work with
const test_template_name = "test_template.test";
const test_template = [
  {
    enums: ["bug", "other"],
    radio: ["yes"],
    text: "a",
    number: 1,
    json: { bleh: "bleh", a: 1 },

    required_automatic: "blah",
    optional_automatic: "bluh",
    email_meta: {
      to: "<Recipient> recipient@email.com",
      from: "<Sender> sender@email.com",
      server_time: "2020-08-04T17:23:05.258Z",
      date: "8/4/2020",
      time: "1:23:05 PM",
      referer: "http://localhost:8080/build/InfoBase/index-eng.html",
    },
  },
  {
    enums: ["bug"],
    radio: ["no"],
    text: "b",
    number: 2,
    json: { bleh: "bleh", a: 2 },

    required_automatic: "blah",
    optional_automatic: "bluh",
    email_meta: {
      to: "<Recipient> recipient@email.com",
      from: "<Sender> sender@email.com",
      server_time: "2020-07-21T16:56:28.611Z",
      date: "7/21/2020",
      time: "12:56:28 PM",
      referer: "http://localhost:8080/build/InfoBase/index-eng.html",
    },
  },
  {
    enums: [],
    radio: [],
    text: "b",
    number: 2,
    json: { bleh: "bleh", a: 2 },

    required_automatic: "blah",
    email_meta: {
      to: "<Recipient> recipient@email.com",
      from: "<Sender> sender@email.com",
      server_time: "2020-07-16T18:15:16.063Z",
      date: "7/16/2020",
      time: "2:15:16 PM",
      referer: "http://localhost:8080/build/InfoBase/index-eng.html",
    },
  },
];

beforeAll((done) => {
  const template = get_templates()[test_template_name];
  connect_db()
    .then(() => {
      const model = make_mongoose_model_from_original_template({
        original_template: template,
        template_name: test_template_name,
      });

      return _.chain(test_template)
        .map((template) => model.create(template))
        .thru((promises) => Promise.all(promises))
        .value();
    })
    .finally(() => {
      mongoose.connection.close();
      done();
    });
});

afterAll((done) => {
  const template = get_templates()[test_template_name];
  connect_db().then(() => {
    make_mongoose_model_from_original_template({
      original_template: template,
      template_name: test_template_name,
    }).collection.drop();
    done();
  });
});

describe("Testing generate_csv.js", () => {
  it("Getting csv output from db", (done) => {
    get_csv_strings()
      .then(({ csv_strings }) => {
        expect(csv_strings).toEqual(expect.any(Object));
        done();
      })
      .catch(() => {
        expect(false).toBe(true);
        done();
      });
  });

  it("Testing csv outputs with snapshot", (done) => {
    get_csv_strings()
      .then(({ csv_strings }) => {
        expect(csv_strings[test_template_name]).toMatchSnapshot();
        done();
      })
      .catch(() => {
        expect(false).toBe(true);
        done();
      });
  });
});
