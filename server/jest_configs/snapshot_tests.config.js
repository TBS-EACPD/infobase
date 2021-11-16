import { common_config_rules } from "./common_config.js";

export default {
  ...common_config_rules,

  testRegex: "\\.snapshot-test\\.js$",
  coverageDirectory: "coverage/snapshot_tests",
  cacheDirectory: ".cache/jest/snapshot_tests",

  setupTestFrameworkScriptFile: "./snapshot_tests_setup.js",
};
