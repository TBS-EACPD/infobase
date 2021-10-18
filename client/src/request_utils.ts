import { log_standard_event } from "src/core/analytics";
import { cdn_url, sha } from "src/core/injected_build_constants";

import { retrying_promise } from "src/general_utils";

//no URL should start with "./" or "/"
export const get_static_url = (url: string, version_query?: string) => {
  const query_string = version_query || sha;

  return `${cdn_url}/${url}?v=${query_string}`;
};

const RETRIES = 3;
export const make_request = (
  url: RequestInfo,
  options: {
    request_log_name?: string;
    success_log_name?: string;
    error_log_name?: string;
    fetch_options?: RequestInit;
  } = {}
) => {
  const {
    request_log_name = url,
    success_log_name = "FETCH_SUCCESS",
    error_log_name = "FETCH_FAILURE",
    fetch_options,
  } = options;

  const time_at_request = Date.now();
  const get_common_log_text = (retry_count: number) =>
    `${request_log_name}, took ${
      Date.now() - time_at_request
    } ms (${retry_count} retries)`;

  return retrying_promise(
    (retry_count) =>
      fetch(url, fetch_options).then((response) => ({
        response,
        retry_count,
      })),
    { retries: RETRIES }
  )
    .then(({ response, retry_count }) => {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: success_log_name,
        MISC2: get_common_log_text(retry_count),
      });

      return response;
    })
    .catch((error) => {
      error.message = `${get_common_log_text(RETRIES)} - ${error.toString()}`;

      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: error_log_name,
        MISC2: error.toString(),
      });

      throw error;
    });
};
