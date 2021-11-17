import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.integration-test\\.js$",
  coverageDirectory: "<rootDir>/.coverage/integration_tests",
  cacheDirectory: "<rootDir>/.cache/jest/integration_tests",
};
