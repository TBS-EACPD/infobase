import _ from "lodash";

const TIMEOUT_WINDOW = process.env.IS_PROD_SERVER ? 60000 : 999;
const REQUESTS_IN_WINDOW_BEFORE_TIMEOUT = 3;

const recent_client_log = {};
const throttle_requests_by_client = (client) => {
  let this_client_is_in_timeout = false;

  if (_(recent_client_log).keys().includes(client)) {
    const log = recent_client_log[client];
    log.requests += 1;

    const too_many_request = log.requests > REQUESTS_IN_WINDOW_BEFORE_TIMEOUT;

    const still_in_timeout =
      Date.now() - log.time_of_last_accepted_request < TIMEOUT_WINDOW;

    if (too_many_request && still_in_timeout) {
      this_client_is_in_timeout = true;
    } else {
      log.time_of_last_accepted_request = Date.now();
    }
  } else {
    recent_client_log[client] = {
      requests: 1,
      time_of_last_accepted_request: Date.now(),
    };
  }

  return this_client_is_in_timeout;
};

export { throttle_requests_by_client };
