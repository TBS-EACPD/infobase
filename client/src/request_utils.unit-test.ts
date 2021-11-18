import { log_standard_event } from "src/core/analytics";

import { make_request } from "./request_utils";

jest.mock("./core/analytics.ts");

const mocked_log_standard_event = log_standard_event as jest.MockedFunction<
  typeof log_standard_event
>;
mocked_log_standard_event.mockImplementation(() => {
  /*noop*/
});

const orignal_fetch = global.fetch;
const mocked_fetch = jest.fn(() => Promise.resolve({}));
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.fetch = mocked_fetch as any;
});
beforeEach(() => {
  mocked_fetch.mockClear();
  mocked_log_standard_event.mockClear();
});
afterAll(() => {
  global.fetch = orignal_fetch;
});

describe("make_request", () => {
  const url = "bleh.com";

  it("Calls fetch with the provided url and fetch_options, returns response", async () => {
    const fetch_options = { headers: { something: "bleh" } };

    const response = { whatever: "yeah" };
    mocked_fetch.mockImplementationOnce(() => Promise.resolve(response));

    const result = await make_request(url, { fetch_options });

    expect(mocked_fetch).toHaveBeenCalledWith(url, fetch_options);
    expect(result).toBe(response);
  });

  it("Logs an event to analytics when configured to, otherwise doesn't", async () => {
    await make_request(url, { should_log: false });
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(0);

    await make_request(url, { should_log: true });
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(1);
  });
  // TODO important to test that it also logs when rejecting/throwing an error, just have to deal with the headache of keeping the error out of the console
});
