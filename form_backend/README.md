[![CircleCI](https://circleci.com/gh/TBS-EACPD/infobase.svg?style=shield)](https://circleci.com/gh/TBS-EACPD/infobase) [![codecov](https://codecov.io/gh/tbs-eacpd/infobase/branch/master/graph/badge.svg?flag=form_backend)](https://app.codecov.io/gh/TBS-EACPD/infobase/)

# Form Backend

Google Cloud Function form backend. More user-friendly and secure/configurable than a mail-to link. Acts as a source of form templates for use in the front end, validates completed form templates received from the front-end, and stores valid form submissions. Also has (light) mitigations in place for spam attempts.

## Table of contents

- [Development](#Development)
- [Endpoints](#Endpoints)
  - [get /form_template_names](#get-formtemplatenames)
  - [get /form_template](#get-formtemplate)
  - [post /submit_form](#post-submitform)
- [Documentation of JSON form templates](#Documentation-of-JSON-form-templates)
- [Spam mitigation](#Spam-mitigation)

### Development pre-requisites

- git
- node@14.x (latest long term support) (`npm install -g n && n lts`)
- npm@8.x (`npm install -g npm@8`)
- MongoDB 5.x, mongosh

## Running locally

1. `cd` to the `InfoBase/form_backend` dir
2. `npm run mongod` (either background the process or run it in its own pane)
3. `npm ci`
4. `npm start` to start a local server on port 7331. Watches and restarts on changes in `src` or `templates`
5. In a separate window run `npm test` to run unit tests in `src` or end-to-end test agaist the local server

## Endpoints

### get /form_template_names

Accepts no arguments.

Responds with an array of names for the set of form templates that the form backend knows.

### get /form_template

Accepts (either in the request body or as a query param) the name of an form template as `template_name`.

Responds with the contents of a specific JSON form template.

### post /submit_form

Accepts the name of an form template contained on the server as `template_name`, and the JSON representation of the corresponding completed form template as `completed_template`. Validates the completed template and, if valid, stores it in the db.

Responds with a status of 200 if the form was valid, was sent without error, and was not rejected by the receiving address.

## Documentation of JSON form templates

See `/templates/test_template.test.json` for an example template containing, in some combination, all possible options.

- There are two types of first level fields:
  - "meta", a reserved key for additional information about the template
    - currently the meta field only has one commonly used field under it, "version". Versioning doesn't currently have an
  - all other fields, which correspond to potential sections of a resulting set of form fields. These fields have up to five sub-fields:
    - "required": true if the field must be included for a completed template to be valid
    - "value_type": the expected type for the completed field value, can be {string, number, json, enum}
    - "enum_values": only used when value_type is enum, a list of value options (along with display values keyed by lang)
    - "form_type": the type of form element to be used by the client. A form_type of `false` is not displayed to the user. In the case of a `false` form_type, the client code needs to populate the value itself on submission (for example, we want to collect build sha's for Report a Problem, but shouldn't make the user input them manually)
    - "form_label": the label the client should display for this form element (keyed by lang)

A completed template is just a set of key-value pairs corresponding to all the fields that were completed on the client.

Currently, its up to clients to consume, display, and properly complete/submit received form templates.

## Spam mitigation

In scripts/prod_deploy_form_backend_function.sh, we set a max-instance of one Google Cloud Function (see Google Cloud docs on max-instances, it's in beta and has caveats). One GCF is sufficient for our current needs, makes it easier for the backend to have a memory of who's recently sent form through it, and in the worst case acts as a capacity-based throttle on any attempt to seriously spam us. Additionally, before actually logging a valid form, /submit_form checks wether the client has already sent three forms within the last minute. If a client has sent more than three forms in the last minute, it gets put "in timeout" and can't send further form for a minute. For the remaining lifetime of the Google Cloud Function instance, this client is limited to one form a minute.

Clients are identified by the IP of their request and, if it exists in the completed template, a special template field with key `"client_id"`.

If you want clients to be able to submit more frequent forms, adjust `TIMEOUT_WINDOW` or `REQUESTS_IN_WINDOW_BEFORE_TIMEOUT` in `src/throttle_requests_by_client.js`. If you receive sustained spikes in requests and require more than 1 instance of the GCF then adjust/remove `--max-instances` in the deploy script. Note that setting a higher number of max-instances compromises the ability to throttle by IP, as the memory of who made what requests is transient and local to each GCF.
