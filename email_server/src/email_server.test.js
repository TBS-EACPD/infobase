import axios from 'axios';
import _ from 'lodash';

describe("End-to-end tests for email_server endpoints", () => {
  // End-to-end sanity tests, matching the expected use (making each API call following and based on the previous)
  // The fact that each of these will be flaky if any of the previous have failed is a feature, not a bug
  // Repeating the same calls across tests is also intentional, if that causes something to flake THAT'S GOOD!

  const port = 7331;
  const make_email_template_name_request = () => axios.get(`http://127.0.0.1:${port}/email_template_names`);
  const make_email_template_request = (lang, template_name) => axios.get(
    `http://127.0.0.1:${port}/email_template?lang=${lang}&template_name=${template_name}`,
    { validateStatus: _.constant(true) } // Don't throw errors on ANY status values, will be intentionally getting some 400's
  );

  it("/email_template_names returns an array of template names", async () => {
    const { data: template_names } = await make_email_template_name_request();

    const template_names_is_array = _.isArray(template_names);
    const template_names_values_are_strings = _.every(template_names, _.isString);

    return expect(template_names_is_array && template_names_values_are_strings).toBe(true);
  });    


  it("/email_template returns status 400 for an invalid lang or invalid template_name", async () => {
    const { data: template_names } = await make_email_template_name_request();

    const { status: bad_lang_status } = await make_email_template_request("Klingon", _.head(template_names));
    const { status: bad_template_name_status } = await make_email_template_request("en", "zzz_unlikely_name");
    const { status: both_bad_template_status } = await make_email_template_request("Vulcan", "yyyImprobableName");

    return expect([bad_lang_status, bad_template_name_status, both_bad_template_status]).toEqual([400, 400, 400]);
  });
  it("/email_template returns a non-empty object when given a valid lang and template_name", async () => {
    const { data: template_names } = await make_email_template_name_request();

    const { data: template } = await make_email_template_request( "en", _.head(template_names) );

    const template_is_valid = template && _.isObject(template) && !_.isEmpty(template);

    return expect(template_is_valid).toBe(true);
  });


  //TODO /submit_email sanity checks

});