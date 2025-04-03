import _ from "lodash";

import { get_client_id, log_standard_event } from "src/core/analytics";
import {
  is_dev,
  local_ip,
  is_ci,
  is_a11y_mode,
  lang,
  sha,
} from "src/core/injected_build_constants";

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

interface CompletedTemplate {
  issue_type?: string[];
  issue_details?: string;
  url?: string;
  lang?: string;
  app_version?: string;
  sha?: string;
  [key: string]: unknown;
}

const send_completed_form_template = (
  template_name: string,
  completed_template: CompletedTemplate
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
    .then((resp) => {
      const is_success = /2[0-9][0-9]/.test(resp.status.toString());

      // First try to parse as JSON, if that fails, get as text
      return resp.text().then((textResponse) => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(textResponse);
        } catch (e) {
          parsedResponse = textResponse;
        }

        if (!is_success) {
          log_error_to_analytics(
            parsedResponse.error_message || parsedResponse
          );
        }

        return {
          success: is_success,
          error_message: parsedResponse.error_message || parsedResponse,
          issueUrl: parsedResponse.issueUrl,
        };
      });
    })
    .catch((error) => ({
      success: false,
      error_message: error.toString(),
    }));

interface AutomaticField {
  is_user_hidden?: boolean;
  [key: string]: unknown;
}

const get_values_for_automatic_fields = (
  automatic_fields: Record<string, AutomaticField>
) => {
  const automatic_field_getters = {
    sha: () => sha,
    route: () => window.location.hash.replace("#", "") || "start",
    lang: () => lang,
    app_version: () => (is_a11y_mode ? "a11y" : "standard"),
    client_id: () => get_client_id(),
    url: () => window.location.href,
    additional: () => ({}),
  } as const;

  return _.mapValues(
    automatic_fields,
    (key: keyof typeof automatic_field_getters) =>
      automatic_field_getters[key]?.()
  );
};

export {
  form_backend_url,
  get_form_template,
  send_completed_form_template,
  get_values_for_automatic_fields,
};
