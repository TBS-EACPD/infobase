import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.end-to-end-test\\.js$",
  coverageDirectory: "<rootDir>/.coverage/end_to_end_tests",
  cacheDirectory: "<rootDir>/.cache/jest/end_to_end_tests",
};
