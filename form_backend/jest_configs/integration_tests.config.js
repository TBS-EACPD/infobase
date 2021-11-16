import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.integration-test\\.js$",
  coverageDirectory: "coverage/integration_tests",
  cacheDirectory: ".cache/jest/integration_tests",
};
