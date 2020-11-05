import _ from "lodash";

import { camel_case_to_snake_case } from "./headcount_model_utils.js";

describe("Headcount Model Utilities", function () {
  it("Converts camel case strings to snake case", () => {
    const camel_case_test_cases = ["A", "AA", "CamelCase", "11", "1A1"];

    const camel_case_and_snake_case_pairs = camel_case_test_cases.map(
      (camel_case_string) => [
        camel_case_string,
        camel_case_to_snake_case(camel_case_string),
      ]
    );

    return expect(camel_case_and_snake_case_pairs).toEqual([
      ["A", "a"],
      ["AA", "a_a"],
      ["CamelCase", "camel_case"],
      ["11", "11"],
      ["1A1", "1a1"],
    ]);
  });
});
