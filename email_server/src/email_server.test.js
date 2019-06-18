import axios from 'axios';
import _ from 'lodash';

describe("End-to-end tests for email_server endpoints", () => {
  // End-to-end sanity tests, matching the expected use (making each API call following and based on the previous)
  // The fact that each of these will be flaky if any of the previous have failed is a feature, not a bug
  // Repeating the same calls across tests is also intentional, if that causes something to flake THAT'S GOOD TO KNOW!

  const port = 7331;
  const make_email_template_names_request = () => axios.get(`http://127.0.0.1:${port}/email_template_names`);
  const make_email_template_request = (template_name) => axios.get(
    `http://127.0.0.1:${port}/email_template?template_name=${template_name}`,
    { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
  );
  const make_submit_email_request = (template_name, completed_template) => axios.post(
    `http://127.0.0.1:${port}/submit_email`,
    {
      template_name,
      completed_template,
    },
    { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
  );
  
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
    const { data: template_names } = await make_email_template_names_request();

    const { data: template } = await make_email_template_request( _.head(template_names) );

    const template_is_valid = template && _.isObject(template) && !_.isEmpty(template);

    return expect(template_is_valid).toBe(true);
  });


  // TODO: Not great... could mock my way out of needing to do this, or just add a static test.json template to ../templates
  const complete_template = (template) => _.chain(template)
    .pickBy( ({required}, field_key) => field_key === "meta" || required )
    .mapValues(
      (field_values, field_key) => {
        if (field_key === "meta"){
          return field_values;
        }

        switch(field_values.value_type){
          case "string":
            return "a";
          case "number":
            return 1;
          case "json":
            return {a: 1};
          default:
            return false; //unexpected type in the json itself
        }
      }
    )
    .value();

  it("/submit_email returns status 400 when a non-existant or invalid template is submitted", async () => {
    const { data: template_names } = await make_email_template_names_request();
    const { data: template } = await make_email_template_request( _.head(template_names) );

    const completed_template = complete_template(template);

    const { status: bad_template_name_status } = await make_submit_email_request("zzz_unlikely_name", completed_template);
    const { status: invalid_template_status } = await make_submit_email_request( _.head(template_names), {bleh: "bleh"} );

    return expect([bad_template_name_status, invalid_template_status]).toEqual([400, 400]);
  });
  it("/submit_email returns status 200 when a valid template is submitted", async () => {
    // Flakes due to timeout if Ethereal can't be reached for test email delivery, TODO mock Ethereal for this test
    const { data: template_names } = await make_email_template_names_request();
    const { data: template } = await make_email_template_request( _.head(template_names) );

    const completed_template = complete_template(template);

    const { status: ok } = await make_submit_email_request( _.head(template_names), completed_template);

    return expect(ok).toEqual(200);
  });

});