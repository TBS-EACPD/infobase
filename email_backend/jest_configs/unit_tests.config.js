const common_config_rules = require("./common_config.js");

module.exports = {
  ...common_config_rules,

  testRegex: "\\.unit-test\\.js$",
  coverageDirectory: "coverage/unit_test_coverage",
};
