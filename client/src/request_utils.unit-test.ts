import { log_standard_event } from "src/core/analytics";

import { make_request } from "./request_utils";

jest.mock("src/core/analytics.ts");
const mocked_log_standard_event = log_standard_event as jest.MockedFunction<
  typeof log_standard_event
>;
mocked_log_standard_event.mockImplementation(() => undefined);

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

  it("Calls fetch with the provided url and fetch_options, returns response on success", async () => {
    const fetch_options = { headers: { something: "bleh" } };

    const response = { whatever: "yeah" };
    mocked_fetch.mockImplementationOnce(() => Promise.resolve(response));

    const result = await make_request(url, { fetch_options });

    expect(mocked_fetch).toHaveBeenCalledWith(url, fetch_options);
    expect(result).toBe(response);
  });

  it("Logs an event to analytics when configured to, both on success and rejection", async () => {
    mocked_fetch.mockImplementation(() => Promise.resolve({}));
    await make_request(url, { should_log: false });
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(0);

    await make_request(url, { should_log: true });
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(1);

    mocked_log_standard_event.mockClear();

    mocked_fetch.mockImplementation(() => Promise.reject());
    await make_request(url, { should_log: false }).catch(() => undefined);
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(0);

    await make_request(url, { should_log: true }).catch(() => undefined);
    expect(mocked_log_standard_event).toHaveBeenCalledTimes(1);
  });
});
