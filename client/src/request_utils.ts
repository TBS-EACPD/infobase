import { log_standard_event } from "src/core/analytics";
import { cdn_url, sha } from "src/core/injected_build_constants";

import { retrying_promise } from "src/general_utils";

//no URL should start with "./" or "/"
export const get_static_url = (url: string, version_query?: string) => {
  const query_string = version_query || sha;

  return `${cdn_url}/${url}?v=${query_string}`;
};

export const make_request = (
  url: RequestInfo,
  options: {
    should_log?: boolean;
    success_log_status?: string;
    error_log_status?: string;
    log_identifier?: string;
    retries?: number;
    fetch_options?: RequestInit;
  } = {}
) => {
  const {
    should_log = true,
    success_log_status = "FETCH_SUCCESS",
    error_log_status = "FETCH_FAILURE",
    log_identifier = url,
    retries = 3,
    fetch_options,
  } = options;

  const time_at_request = Date.now();
  const get_common_log_text = (retry_count: number) =>
    `${log_identifier}, took ${
      Date.now() - time_at_request
    } ms (${retry_count} retries)`;

  return retrying_promise(
    (retry_count) =>
      fetch(url, fetch_options).then((response) => ({
        response,
        retry_count,
      })),
    { retries }
  )
    .then(({ response, retry_count }) => {
      should_log &&
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: success_log_status,
          MISC2: get_common_log_text(retry_count),
        });

      return response;
    })
    .catch((error) => {
      if (typeof error?.message === "undefined") {
        error = new Error(error || "No error specified");
      }

      error.message = `${get_common_log_text(retries)} - ${error.toString()}`;

      should_log &&
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: error_log_status,
          MISC2: error.toString(),
        });

      throw error;
    });
};
