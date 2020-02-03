import axios from 'axios';
import nodemailer from 'nodemailer';
import _ from 'lodash';

// eslint-disable-next-line no-unused-vars
import { email_backend } from './index.js'; // Server's started as side effect of import, kind of a GCloud Function thing although I could clean that up

describe("End-to-end tests for email_backend endpoints", () => {
  const prod_test_url = "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";
  const local_test_url = `http://127.0.0.1:7331`;
  
  const test_against_prod = false;
  const test_url = test_against_prod ? prod_test_url: local_test_url;

  const make_email_template_names_request = () => axios.get(`${test_url}/email_template_names`);
  const make_email_template_request = (template_name) => axios.get(
    `${test_url}/email_template?template_name=${template_name}`,
    { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
  );
  const make_submit_email_request = (template_name, completed_template) => axios.post(
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
      subject_template: "Test subject: [${enums}], ${number}",
    },
  
    enums: ["bug", "other"],
    text: "a",
    number: 1,
    json: {bleh: "bleh", a: 1},
  
    required_automatic: "blah",
    optional_automatic: "bluh",
  };
  
  
  it("/email_template_names returns an array of template names", async () => {
    const { data: template_names } = await make_email_template_names_request();

    const template_names_is_array = _.isArray(template_names);
    const template_names_values_are_strings = _.every(template_names, _.isString);

    return expect(template_names_is_array && template_names_values_are_strings).toBe(true);
  });    


  it("/email_template returns status 400 for an invalid invalid template_name", async () => {
    const { status: bad_template_name_status } = await make_email_template_request("zzz_unlikely_name");

    return expect(bad_template_name_status).toBe(400);
  });

  it("/email_template returns a non-empty object when given a valid template_name", async () => {
    const { data: template } = await make_email_template_request(test_template_name);

    const template_is_valid = template && _.isObject(template) && !_.isEmpty(template);

    return expect(template_is_valid).toBe(true);
  });


  it("/submit_email returns status 400 when a non-existant or invalid template is submitted", async () => {
    const { status: bad_template_name_status } = await make_submit_email_request("zzz_unlikely_name", completed_test_template);
    const { status: invalid_template_status } = await make_submit_email_request(test_template_name, {bleh: "bleh"});

    return expect([bad_template_name_status, invalid_template_status]).toEqual([400, 400]);
  });

  // this test is flaky due to its reliance on a third party service to validate submitted emails
  const ethereal_timeout_limit = 60000;
  it("/submit_email returns status 200 when a valid template is submitted", 
    async () => {
      try {
        // Check if Ethereal can be reached to test mail sending, this test will be skipped (passingly) if it can't be
        await nodemailer.createTestAccount();
      } catch(error){
        if ( /getaddrinfo/.test(error) ){
          // eslint-disable-next-line no-console
          console.log("Didn't run end-to-end test on /submit_email because Ethereal could not be reached to mock sending mail.");
          return expect("Oops, this is flaky").toEqual("Oops, this is flaky");
        }
      }

      const { status: ok } = await make_submit_email_request(test_template_name, completed_test_template);

      return expect(ok).toBe(200);
    },
    ethereal_timeout_limit
  );
});