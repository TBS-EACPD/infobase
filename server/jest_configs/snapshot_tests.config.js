import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.snapshot-test\\.js$",
  coverageDirectory: "<rootDir>/.coverage/snapshot_tests",
  cacheDirectory: "<rootDir>/.cache/jest/snapshot_tests",

  setupTestFrameworkScriptFile: "<rootDir>/src/snapshot_tests_setup.js",
};
