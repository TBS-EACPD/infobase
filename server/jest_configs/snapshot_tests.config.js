const common_config_rules = require("./common_config.js");

module.exports = {
  ...common_config_rules,

  testRegex: "\\.snapshot-test\\.js$",
  coverageDirectory: "../coverage/snapshot_test_coverage",
  setupTestFrameworkScriptFile: "./snapshot_tests_setup.js",
};
