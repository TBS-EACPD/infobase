# Email Server

Google Cloud Function email backend. More user-friendly and secure/configurable than a mail-to link. Acts as a source of email templates for use in the front end, validates completed email templates received from the front-end, and sends valid, formatted, emails on to recipient email accouts. The backend sending/receiving emails remain unknown to the clien submitting the email, to protect both the client's identity and our inboxes from spam. Also has mitigations in place for attempts to spam the receiving address through the send email API.

## Development
  0. Install node, npm, git. Clone the InfoBase repo 
  1. `cd` to the `InfoBase/email_backend` dir
  2. Run `npm ci`
  3. Run `npm start` to start a local server on port 7331. Note: you'll need to restart this server whenever you want it to reflect changes to made in `src`
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

TODO

## Spam mitigation
In deploy_scripts/prod_deploy_email_backend_function.sh, sets a max-instance of 1 (see Google Cloud docs on max-instances, it's in beta and has caveats). One Google Cloud Function is sufficient for our current needs, makes it easier for the backend to have a memory of who's recently sent email through it, and in the worst case acts as a capacity-based throttle on any attempt to seriously spam us.
Additionally, before sending a valid email out, /submit_email checks wether the client IP has already sent three emails within the last minute. If an IP has sent more than three emails in the last minute, it get's put "in timeout" and can't send further email for a minute. For the remaining lifetime of the Google Cloud Function instance, this IP is limited to one email a minute.

If you want clients to be able to send more frequent emails, adjust `TIMEOUT_WINDOW` or `REQUESTS_IN_WINDOW_BEFORE_TIMEOUT` in `src/throttle_requests_by_ip.js`. If you receive sustained spikes in requests and require more than 1 instance of the GCF then adjust/remove `--max-instances` in the deploy script. Note that setting a hire number of max-instances compromises the abbility to throttle by IP as the memory of who made what requests is transient and specific to each GCF.