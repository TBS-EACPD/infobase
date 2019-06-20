import _ from 'lodash';

const recent_ip_log = {};
const throttle_requests_by_ip = (ip) => {
  let this_ip_is_in_timeout = false;

  if ( _.chain(recent_ip_log).keys().includes(ip).value() ){
    const log = recent_ip_log[ip];

    const too_many_request = log.requests > 3;

    const still_in_timeout = Date.now() - log.time_of_last_accepted_request < 60000;

    log.requests += 1;
    if (too_many_request && still_in_timeout){
      this_ip_is_in_timeout = true;
    } else {
      log.time_of_last_accepted_request = Date.now();
    }
  } else {
    recent_ip_log[ip] = {
      requests: 1,
      time_of_last_accepted_request: Date.now(),
    };
  }

  return this_ip_is_in_timeout;
};

export { throttle_requests_by_ip };