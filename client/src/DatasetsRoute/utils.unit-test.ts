import type { Sources, SourceKey } from "src/models/metadata/Sources";

import { with_console_error_silenced } from "src/testing_utils";

import { get_source_link, get_source_links } from "./utils";

// A bit of an iffy mock, but I trust the type system to keep it relatively maintainable
jest.mock("src/models/metadata/Sources", () => {
  const mock_Sources: Partial<{
    [key in SourceKey]: Partial<typeof Sources[key]>;
  }> = {
    public_accounts: { name: "Public Accounts" },
    estimates: { name: "Estimates" },
  };

  return {
    __esModule: true,
    Sources: mock_Sources,
  };
});

describe("get_source_link", () => {
  it("Given a Sources key, returns an href to the relevant datasets route section and some text to use for that link", () => {
    expect(get_source_link("public_accounts")).toEqual({
      href: "#datasets/public_accounts",
      html: "Public Accounts",
    });
  });

  it("Throws when given a non-valid Sources key", () => {
    with_console_error_silenced(() => {
      expect(() => get_source_link("adfafafdsas" as SourceKey)).toThrow();
    });
  });
});

describe("get_source_links", () => {
  it("Given an array of Sources keys, returns an array of hrefs to the relevant datasets route sections and text to use for those links", () => {
    expect(get_source_links(["public_accounts", "estimates"])).toEqual([
      { href: "#datasets/public_accounts", html: "Public Accounts" },
      { href: "#datasets/estimates", html: "Estimates" },
    ]);
  });

  it("Throws when array contains a non-valid Sources key", () => {
    with_console_error_silenced(() => {
      expect(() =>
        get_source_links(["estimates", "adfafafdsas"] as SourceKey[])
      ).toThrow();
    });
  });
});
