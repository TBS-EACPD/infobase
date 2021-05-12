import { is_dev, local_ip, is_ci } from "src/core/injected_build_constants";

import { log_standard_event } from "./core/analytics";

const email_backend_url =
  is_dev && !is_ci
    ? `http://${local_ip || "127.0.0.1"}:7331`
    : "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";

const log_error_to_analytics = (error_message) =>
  log_standard_event({
    SUBAPP: window.location.hash.replace("#", ""),
    MISC1: "EMAIL_BACKEND_ERROR",
    MISC2: error_message,
  });

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

const get_email_template_names = () =>
  fetch(`${email_backend_url}/email_template_names`, {
    method: "GET",
    mode: "cors",
  })
    .then((resp) => resp.text())
    .catch((error) => {
      log_error_to_analytics(error); // eslint-disable-line no-console
      return [];
    });

const get_email_template = (template_name) =>
  fetch(`${email_backend_url}/email_template?template_name=${template_name}`, {
    method: "GET",
    mode: "cors",
  })
    .then((resp) =>
      /2[0-9][0-9]/.test(resp.status)
        ? resp.json()
        : resp.text().then((error) => {
            log_error_to_analytics(error);
            return format_error_as_email_template(error);
          })
    )
    .catch((error) => {
      log_error_to_analytics(error);
      return format_error_as_email_template(error);
    });

const send_completed_email_template = (template_name, completed_template) =>
  fetch(`${email_backend_url}/submit_email`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      template_name,
      completed_template,
    }),
  })
    .then((resp) =>
      resp.text().then((response_text) => {
        const is_error = /2[0-9][0-9]/.test(resp.status);
        is_error && log_error_to_analytics(response_text);
        return {
          success: is_error,
          error_message: is_error ? response_text : "",
        };
      })
    )
    .catch(log_error_to_analytics);

export {
  get_email_template_names,
  get_email_template,
  send_completed_email_template,
};
