import { throttle_requests_by_client } from "./throttle_requests_by_client.js";

const promise_timeout = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(time), time);
  });
};

describe("throttle_requests_by_client", () => {
  const client_one = "192.0.2.1";
  const client_two = "a_client_id_123";

  it("accepts the first three request from the same client within the timeout_window", () =>
    expect([
      throttle_requests_by_client(client_one),
      throttle_requests_by_client(client_one),
      throttle_requests_by_client(client_one),
    ]).toEqual([false, false, false]));
  it("at the fourth request within the timeout_window, put the client in timeout and reject following requests", () =>
    expect([
      throttle_requests_by_client(client_one),
      throttle_requests_by_client(client_one),
    ]).toEqual([true, true]));
  it("meanwhile, still accepts requests from other clients", () =>
    expect(throttle_requests_by_client(client_two)).toBe(false));
  it("after the timeout_window, accepts the next request from the spammy client. Puts them back on timeout if they make yet another after that", () =>
    promise_timeout(1000).then(() =>
      expect([
        throttle_requests_by_client(client_one),
        throttle_requests_by_client(client_one),
      ]).toEqual([false, true])
    ));
});
