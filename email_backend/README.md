# Email Server

Google Cloud Function email backend. More user-friendly and secure/configurable than a mail-to link. Acts as a source of email templates for use in the front end, validates completed email templates received from the front-end, and sends valid, formatted, emails on to recipient email accounts. The backend sending/receiving emails remain unknown to the client submitting the email, to protect both the client's identity and our inboxes from spam. Also has mitigations in place for attempts to spam the receiving address through the send email API.

## Table of contents
  - [Development](#Development)
  - [Endpoints](#Endpoints)
    - [get /email_template_names](#get-emailtemplatenames)
    - [get /email_template](#get-emailtemplate)
    - [post /submit_email](#post-submitemail)
  - [Documentation of JSON email templates](#Documentation-of-JSON-email-templates)
  - [Spam mitigation](#Spam-mitigation)

## Development
  0. Install node, npm, git. Clone the InfoBase repo 
  1. `cd` to the `InfoBase/email_backend` dir
  2. Run `npm ci`
  3. Run `npm start` to start a local server on port 7331. Watches for changes in `src` or `templates`
  4. In a separate window run `npm test` to run unit tests in `src` as well as end-to-end test agaist the local server

## Endpoints

### get /email_template_names
Accepts no arguments.

Responds with an array names for the set of templates that the email backend holds/accepts.

### get /email_template
Accepts (either in the request body or as a query param) the name of an email template as `template_name`.

Responds with the contents of a specific JSON email template.

### post /submit_email
Accepts the name of an email template contained on the server as `template_name`, and the JSON representation of the corresponding completed email template as `completed_template`. Validates the completed template and, if valid, formats and delivers it to the receiving address.

Responds with a status of 200 if the email was valid, was sent without error, and was not rejected by the receiving address.

## Documentation of JSON email templates

See `/templates/test_template.test.json` for an example template containing, in some combination, all possible options.
  - There are two types of first level fields:
    - "meta", a reserved key for additional information about the template
      - currently the meta field only has one field under it, "subject_template". The value of subject_template is a template string with JS template string where the names of template values correspond to the names of other field keys in the json template. This string is interpolated with the corresponding values from a completed template to build the final email subject line.
    - all other fields, which correspond to potential sections of a resulting email body. These fields have up to five sub-fields:
      - "required": true if the field must be included for a completed template to be valid
      - "value_type": the expected type for the completed field value, can be {string, number, json, enum}
      - "enum_values": only used when value_type is enum, a list of value options (with display values keyed by lang)
      - "form_type": the type of form element to be used by the client. A form_type of `false` is not displayed to the user, the client code needs to populate its value itself (for example, we want build sha's for Report a Problem, but shouldn't make the user input them manually)
      - "form_label": the label the client should display for this form element (keyed by lang)

A completed template is just a set of key-value pairs corresponding to all the fields that were completed on the client.

## Spam mitigation
In deploy_scripts/prod_deploy_email_backend_function.sh, sets a max-instance of 1 (see Google Cloud docs on max-instances, it's in beta and has caveats). One Google Cloud Function is sufficient for our current needs, makes it easier for the backend to have a memory of who's recently sent email through it, and in the worst case acts as a capacity-based throttle on any attempt to seriously spam us.
Additionally, before sending a valid email out, /submit_email checks wether the client has already sent three emails within the last minute. If a client has sent more than three emails in the last minute, it gets put "in timeout" and can't send further email for a minute. For the remaining lifetime of the Google Cloud Function instance, this client is limited to one email a minute.

Clients are identified by IP and, if it exists in the completed template, a special template field with key `"client_id"`.

If you want clients to be able to send more frequent emails, adjust `TIMEOUT_WINDOW` or `REQUESTS_IN_WINDOW_BEFORE_TIMEOUT` in `src/throttle_requests_by_ip.js`. If you receive sustained spikes in requests and require more than 1 instance of the GCF then adjust/remove `--max-instances` in the deploy script. Note that setting a hire number of max-instances compromises the ability to throttle by IP as the memory of who made what requests is transient and specific to each GCF.