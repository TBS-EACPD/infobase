const common_config_rules = require("./common_config.js");

module.exports = {
  ...common_config_rules,

  testRegex: "\\.end-to-end-test\\.js$",
  coverageDirectory: "coverage/end_to_end_test_coverage",
};
