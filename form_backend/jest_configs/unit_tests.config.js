import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.unit-test\\.js$",
  coverageDirectory: "<rootDir>/coverage/unit_tests",
  cacheDirectory: "<rootDir>/.cache/jest/unit_tests",
};
