import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.end-to-end-test\\.js$",
  coverageDirectory: "coverage/end_to_end_tests",
  cacheDirectory: ".cache/jest/end_to_end_tests",
};
