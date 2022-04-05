import type {
  DataSources,
  DataSourceKey,
} from "src/models/metadata/DataSources";

import { with_console_error_silenced } from "src/testing_utils";

import { get_source_link, get_source_links } from "./utils";

// A bit of an iffy mock, but I trust the type system to keep it relatively maintainable
jest.mock("src/models/metadata/DataSources", () => {
  const mock_DataSources: Partial<{
    [key in DataSourceKey]: Partial<typeof DataSources[key]>;
  }> = {
    public_accounts: { name: "Public Accounts" },
    estimates: { name: "Estimates" },
  };

  return {
    __esModule: true,
    DataSources: mock_DataSources,
  };
});

describe("get_source_link", () => {
  it("Given a DataSources key, returns an href to the relevant datasets route section and some text to use for that link", () => {
    expect(get_source_link("public_accounts")).toEqual({
      href: "#datasets/public_accounts",
      html: "Public Accounts",
    });
  });

  it("Throws when given a non-valid DataSources key", () => {
    with_console_error_silenced(() => {
      expect(() => get_source_link("adfafafdsas" as DataSourceKey)).toThrow();
    });
  });
});

describe("get_source_links", () => {
  it("Given an array of DataSources keys, returns an array of hrefs to the relevant datasets route sections and text to use for those links", () => {
    expect(get_source_links(["public_accounts", "estimates"])).toEqual([
      { href: "#datasets/public_accounts", html: "Public Accounts" },
      { href: "#datasets/estimates", html: "Estimates" },
    ]);
  });

  it("Throws when array contains a non-valid DataSources key", () => {
    with_console_error_silenced(() => {
      expect(() =>
        get_source_links(["estimates", "adfafafdsas"] as DataSourceKey[])
      ).toThrow();
    });
  });
});
