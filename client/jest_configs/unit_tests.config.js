const { common_config_rules } = require("./common_config");

module.exports = {
  ...common_config_rules,

  testRegex: "\\.unit-test\\.(js|ts|tsx)$",
  coverageDirectory: "coverage/unit_test_coverage",
};
