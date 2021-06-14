import axios from "axios";
import _ from "lodash";

const promise_timeout_race = (
  promise,
  time_limit,
  timeout_callback = _.noop
) => {
  const timeout_promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);

      timeout_callback(resolve, reject);
    }, time_limit);
  });

  return Promise.race([promise, timeout_promise]);
};

// mocking JUST nodemailer.createTransport, from nodemailer leaving everything else with its original implementation...
// is there a more direct way to do this?
jest.mock("nodemailer");
import nodemailer from "nodemailer";
const { ...actual_nodemailer } = jest.requireActual("nodemailer");

_.each(nodemailer, (member, identifier) =>
  member.mockImplementation(actual_nodemailer[identifier])
);

const ethereal_timeout_limit = 20000;

const timed_out_flag = "TIMEDOUT";
nodemailer.createTestAccount.mockImplementation(() =>
  promise_timeout_race(
    actual_nodemailer.createTestAccount(),
    ethereal_timeout_limit,
    (resolve, reject) => resolve(timed_out_flag)
  )
);

nodemailer.createTransport.mockImplementation((transport_config) => {
  const alert_to_flaked_test = () =>
    console.log(
      `FLAKY TEST ALERT: was unable to reach ethereal within ${ethereal_timeout_limit}ms, giving up but not failing the test over it.`
    );

  if (transport_config.auth === timed_out_flag) {
    alert_to_flaked_test();

    return { sendMail: () => ({ response: "200" }) };
  }

  const transporter = actual_nodemailer.createTransport(transport_config);

  return {
    ...transporter,
    sendMail: (options) => {
      const send_mail_promise = transporter.sendMail(options);

      const timeout_callback = (resolve, reject) => {
        alert_to_flaked_test();

        resolve({ response: "200" });
      };

      return promise_timeout_race(
        send_mail_promise,
        ethereal_timeout_limit,
        timeout_callback
      );
    },
  };
});

// not going to run a db for these end to end tests, mock away attempts to use it
jest.mock("./db_utils/index.js");
import {
  connect_db,
  get_db_connection_status,
  log_email_and_meta_to_db,
} from "./db_utils/index.js";
connect_db.mockImplementation(() => Promise.resolve());
get_db_connection_status.mockImplementation(() => "connected");
const mock_log_email_and_meta_to_db =
  log_email_and_meta_to_db.mockImplementation(() => Promise.resolve());

import { run_email_backend } from "./email_backend.js";
beforeAll((done) => {
  run_email_backend();
  done();
});

describe("End-to-end tests for email_backend endpoints", () => {
  const prod_test_url =
    "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";
  const local_test_url = `http://127.0.0.1:7331`;

  const test_against_prod = false;
  const test_url = test_against_prod ? prod_test_url : local_test_url;

  const make_email_template_names_request = () =>
    axios.get(`${test_url}/email_template_names`);
  const make_email_template_request = (template_name) =>
    axios.get(
      `${test_url}/email_template?template_name=${template_name}`,
      { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
    );
  const make_submit_email_request = (template_name, completed_template) =>
    axios.post(
      `${test_url}/submit_email`,
      {
        template_name,
        completed_template,
      },
      { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
    );

  const test_template_name = "test_template.test";
  const completed_test_template = {
    meta: {
      subject_template: "Test subject: [${enums}], [${radio}], ${number}",
    },

    enums: ["bug", "other"],
    radio: ["yes"],
    text: "a",
    number: 1,
    json: { bleh: "bleh", a: 1 },

    required_automatic: "blah",
    optional_automatic: "bluh",
  };

  it("/email_template_names returns an array of template names", async () => {
    const { data: template_names } = await make_email_template_names_request();

    const template_names_is_array = _.isArray(template_names);
    const template_names_values_are_strings = _.every(
      template_names,
      _.isString
    );

    return expect(
      template_names_is_array && template_names_values_are_strings
    ).toBe(true);
  });

  it("/email_template returns status 400 for an invalid invalid template_name", async () => {
    const { status: bad_template_name_status } =
      await make_email_template_request("zzz_unlikely_name");

    return expect(bad_template_name_status).toBe(400);
  });

  it("/email_template returns a non-empty object when given a valid template_name", async () => {
    const { data: template } = await make_email_template_request(
      test_template_name
    );

    const template_is_valid =
      template && _.isObject(template) && !_.isEmpty(template);

    return expect(template_is_valid).toBe(true);
  });

  it("/submit_email returns status 400 when a non-existant or invalid template is submitted", async () => {
    const { status: bad_template_name_status } =
      await make_submit_email_request(
        "zzz_unlikely_name",
        completed_test_template
      );
    const { status: invalid_template_status } = await make_submit_email_request(
      test_template_name,
      { bleh: "bleh" }
    );

    return expect([bad_template_name_status, invalid_template_status]).toEqual([
      400, 400,
    ]);
  });

  // this test is flaky due to its reliance on a third party service to validate submitted emails; the services is occasionally unresponsive
  it(
    "/submit_email returns status 200 and trys to log to db when a valid template is submitted",
    async () => {
      // note: log_email_and_meta_to_db is mocked to a noop. Not testing that logging actually works at this level,
      // just that the server tries to call log_email_and_meta_to_db when it is expected to
      // TODO: should we also test that the correct args are at least passed? That's currently a testing gap

      const { status: ok } = await make_submit_email_request(
        test_template_name,
        completed_test_template
      );

      return (
        expect(ok).toBe(200) &&
        expect(mock_log_email_and_meta_to_db).toBeCalledOnce()
      );
    },
    // timeout on the async returning, just needs to be significantly longer than ethereal_timeout_limit. Shouldn't hit the Jest level timeout as the time-constraint in this test
    // is communications with ethereal, which is being timed out after ethereal_timeout_limit. If an ethereal_timeout_limit is hit, then this test flakes passingly (not great, but it
    // was between that and just dropping this test altogether). Can still flake if the Jest level timeout is hit for nondeterministic system resource/event loop reasons, ah well!
    ethereal_timeout_limit * 5
  );
});
