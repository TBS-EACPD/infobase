import { log_standard_event } from "src/core/analytics";
import { is_dev, local_ip, is_ci } from "src/core/injected_build_constants";

import { make_request } from "src/request_utils";

const request_logging_options = {
  success_log_status: "FORM_BACKEND_SUCCESS",
  error_log_status: "FORM_BACKEND_ERROR",
};

const form_backend_url =
  is_dev && !is_ci
    ? `http://${local_ip || "127.0.0.1"}:7331`
    : "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";

const log_error_to_analytics = (error_message: string) =>
  log_standard_event({
    SUBAPP: window.location.hash.replace("#", ""),
    MISC1: request_logging_options.error_log_status,
    MISC2: error_message,
  });

const format_error_as_form_template = (error_message: string) => ({
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

const get_form_template = (template_name: string) =>
  make_request(
    `${form_backend_url}/form_template?template_name=${template_name}`,
    request_logging_options
  )
    .then((resp) =>
      /2[0-9][0-9]/.test(resp.status.toString())
        ? resp.json()
        : resp.text().then((error) => {
            log_error_to_analytics(error);
            return format_error_as_form_template(error);
          })
    )
    .catch((error) => format_error_as_form_template(error.toString()));

const send_completed_form_template = (
  template_name: string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  completed_template: Record<string, any>
) =>
  make_request(`${form_backend_url}/submit_form`, {
    ...request_logging_options,
    fetch_options: {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_name,
        completed_template,
      }),
    },
  })
    .then((resp) =>
      resp.text().then((response_text) => {
        const is_error = /2[0-9][0-9]/.test(resp.status.toString());
        is_error && log_error_to_analytics(response_text);
        return {
          success: is_error,
          error_message: response_text,
        };
      })
    )
    .catch((error) => ({
      success: false,
      error_message: error.toString(),
    }));

export { form_backend_url, get_form_template, send_completed_form_template };
