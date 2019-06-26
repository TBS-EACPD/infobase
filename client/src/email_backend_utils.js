const email_backend_url = window.is_dev ? 
  `http://${ window.local_ip || "127.0.0.1" }:7331` :
  "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";

const get_email_template_names = () => fetch(
  `${email_backend_url}/email_template_names`,
  {
    method: 'GET',
    mode: "cors",
  }
).then( resp => resp.text() );

const get_email_template = (template_name) => fetch(
  `${email_backend_url}/email_template?template_name=${template_name}`,
  {
    method: 'GET',
    mode: "cors",
  }
).then( (resp) => resp.json() );

const send_completed_email_template = (template_name, completed_template) => fetch(
  `${email_backend_url}/submit_email`,
  {
    method: 'POST',
    mode: "cors",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      template_name,
      completed_template,
    }),
  }
).then( ({status}) => /2[0-9][0-9]/.test(status) ) // CORS preflight
  .then( ({status}) => /2[0-9][0-9]/.test(status) ); // actually ending the email

export {
  get_email_template_names,
  get_email_template,
  send_completed_email_template,
};