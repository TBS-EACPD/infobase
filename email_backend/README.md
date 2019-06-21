# Email Server

Google Cloud Function email backend. More user-friendly and secure/configurable than a mail-to link. Validates and formats email templates received from the front-end. Sends on valid emails from and to email accouts unknown to the clien submitting the email, to protect both the client's identity and your receiving inbox's address.

## Endpoints

### get /email_template_names
Accepts no arguments.

Responds with an array names for the set of v that the email backend holds/accepts.

### get /email_template
Accepts (either in the request body or as a query param) the name of an email template contained on the server as `template_name`.

Responds with the contents of a specific JSON email template.

### post /submit_email
Accepts the name of an email template contained on the server as `template_name`, and the JSON representation of the corresponding email template as `completed_template`. Validates the completed template and, if valid, formats and delivers it.

Responds with a status of 200 if the email was valid, was sent without error, and was not rejected by the receiving address.

## Documentation of JSON email templates

TODO

## Spam mitigation
In deploy_scripts/prod_deploy_email_backend_function.sh, sets a max-instance of 1 (see Google Cloud docs on max-instances, it's in beta and has caveats). Additionally, before sending a valid email out, /submit_email checks that the client IP has already sent three emails in the last minute. If an IP has sent more than three emails in the last minute, it get's put "in timeout" and can't send email for a minute. For the remaining lifetime of the Google Cloud Function instance, this IP is limited to one email a minute.

If you want clients to be able to send more frequent emails, adjust `TIMEOUT_WINDOW` in `src/throttle_requests_by_ip.js`. If you receive sustained spikes in requests and require more than 1 instance of the GCF then adjust/remove `--max-instances` in the deploy script. Note that setting a hire number of max-instances compromises the abbility to throttle by IP as the memory of who made what requests is transient and specific to each GCF.