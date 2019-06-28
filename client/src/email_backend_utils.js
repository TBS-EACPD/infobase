const email_backend_url = window.is_dev && !window.is_ci ? 
  `http://${ window.local_ip || "127.0.0.1" }:7331` :
  "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";

const format_error_as_email_template = (error_message) => ({
  error: {
    required: "true",
    value_type: "error",
    form_type: "error",
    form_label: {
      en: `An error has occured (${error_message})`,
      fr: `Une erreur est survenue (${error_message})`,
    },
  },
});

const get_email_template_names = () => fetch(
  `${email_backend_url}/email_template_names`,
  {
    method: 'GET',
    mode: "cors",
  }
)
  .then( resp => resp.text() )
  .catch( error => {
    console.log(error); // eslint-disable-line no-console
    return [];
  });

const get_email_template = (template_name) => fetch(
  `${email_backend_url}/email_template?template_name=${template_name}`,
  {
    method: 'GET',
    mode: "cors",
  }
)
  .then( 
    (resp) => /2[0-9][0-9]/.test(resp.status) ? 
      resp.json() : 
      resp.text().then(format_error_as_email_template) 
  )
  .catch(format_error_as_email_template);

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
)
  .then( 
    (resp) => resp.text()
      .then( error_message => ({
        success: /2[0-9][0-9]/.test(resp.status),
        error_message: error_message,
      }) )
  );

export {
  get_email_template_names,
  get_email_template,
  send_completed_email_template,
};