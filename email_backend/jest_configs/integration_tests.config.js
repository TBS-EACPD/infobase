const common_config_rules = require("./common_config.js");

module.exports = {
  ...common_config_rules,

  testRegex: "\\.integration-test\\.js$",
  coverageDirectory: "../coverage/integration_test_coverage",
};
