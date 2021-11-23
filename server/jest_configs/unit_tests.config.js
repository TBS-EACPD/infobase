import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.unit-test\\.js$",
  coverageDirectory: "coverage/unit_tests",
  cacheDirectory: ".cache/jest/unit_tests",
};
