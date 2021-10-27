import axios from "axios";
import _ from "lodash";

// not going to run a db for these end to end tests, mock away attempts to use it
jest.mock("./db_utils/index.js");
import {
  connect_db,
  get_db_connection_status,
  log_to_db,
} from "./db_utils/index.js";
connect_db.mockImplementation(() => Promise.resolve());
get_db_connection_status.mockImplementation(() => "connected");
const mock_log_to_db = log_to_db.mockImplementation(() => Promise.resolve());

import { run_form_backend } from "./form_backend.js";
beforeAll((done) => {
  run_form_backend();
  done();
});

describe("End-to-end tests for form_backend endpoints", () => {
  const prod_test_url =
    "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";
  const local_test_url = `http://127.0.0.1:7331`;

  const test_against_prod = false;
  const test_url = test_against_prod ? prod_test_url : local_test_url;

  const make_form_template_names_request = () =>
    axios.get(`${test_url}/form_template_names`);
  const make_form_template_request = (template_name) =>
    axios.get(
      `${test_url}/form_template?template_name=${template_name}`,
      { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
    );
  const make_submit_form_request = (template_name, completed_template) =>
    axios.post(
      `${test_url}/submit_form`,
      {
        template_name,
        completed_template,
      },
      { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
    );

  const test_template_name = "test_template.test";
  const completed_test_template = {
    meta: {
      version: "1.0",
    },

    enums: ["bug", "other"],
    radio: ["yes"],
    text: "a",
    number: 1,
    json: { bleh: "bleh", a: 1 },

    required_automatic: "blah",
    optional_automatic: "bluh",
  };

  it("/form_template_names returns an array of template names", async () => {
    const { data: template_names } = await make_form_template_names_request();

    const template_names_is_array = _.isArray(template_names);
    const template_names_values_are_strings = _.every(
      template_names,
      _.isString
    );

    return expect(
      template_names_is_array && template_names_values_are_strings
    ).toBe(true);
  });

  it("/form_template returns status 400 for an invalid invalid template_name", async () => {
    const { status: bad_template_name_status } =
      await make_form_template_request("zzz_unlikely_name");

    return expect(bad_template_name_status).toBe(400);
  });

  it("/form_template returns a non-empty object when given a valid template_name", async () => {
    const { data: template } = await make_form_template_request(
      test_template_name
    );

    const template_is_valid =
      template && _.isObject(template) && !_.isEmpty(template);

    return expect(template_is_valid).toBe(true);
  });

  it("/submit_form returns status 400 when a non-existant or invalid template is submitted", async () => {
    const { status: bad_template_name_status } = await make_submit_form_request(
      "zzz_unlikely_name",
      completed_test_template
    );
    const { status: invalid_template_status } = await make_submit_form_request(
      test_template_name,
      { bleh: "bleh" }
    );

    return expect([bad_template_name_status, invalid_template_status]).toEqual([
      400, 400,
    ]);
  });

  it("/submit_form logs to db and returns 200 when valid form submitted", async () => {
    // note: log_to_db is mocked to a noop. Not testing that logging actually works at this level,
    // just that the server tries to call log_to_db when it is expected to
    // TODO: should we also test that the correct args are at least passed? That's currently a testing gap

    const { status: ok } = await make_submit_form_request(
      test_template_name,
      completed_test_template
    );

    return expect(ok).toBe(200) && expect(mock_log_to_db).toBeCalledOnce();
  });
});
