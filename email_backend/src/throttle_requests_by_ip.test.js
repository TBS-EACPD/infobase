import { throttle_requests_by_ip } from './throttle_requests_by_ip.js';

const promise_timeout = (time) => {
  return new Promise(
    (resolve, reject) =>{
      setTimeout( () => resolve(time), time );
    }
  );
};

describe("throttle_requests_by_ip", () => {

  const ip_one = "192.00.00.01";
  const ip_two = "192.00.00.02";

  it(
    "accepts the first three request from an IP within the timeout_window",
    () => expect([throttle_requests_by_ip(ip_one), throttle_requests_by_ip(ip_one), throttle_requests_by_ip(ip_one)]).toEqual([false, false, false])
  );
  it(
    "at the fourth request within the timeout_window, put the IP in timeout and reject following requests",
    () => expect([throttle_requests_by_ip(ip_one), throttle_requests_by_ip(ip_one)]).toEqual([true, true])
  );
  it(
    "meanwhile, still accepts requests from other ips",
    () => expect( throttle_requests_by_ip(ip_two) ).toBe(false)
  );
  it(
    "after the timeout_window, accepts the next request from the spammy IP. Puts them back on timeout if they make yet another after that",
    () => promise_timeout(1000)
      .then(
        () => expect([throttle_requests_by_ip(ip_one), throttle_requests_by_ip(ip_one)]).toEqual([false, true])
      )
  );
});