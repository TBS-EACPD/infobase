const { common_config_rules } = require("./common_config");

// TODO, these will need to run additional pre-test setup for the global systems like text_maker+handlebars, etc
// will need to overwrite at least some moduleNameMapper empty mock targets with custom loaders

module.exports = {
  ...common_config_rules,

  testRegex: "\\.integration-test\\.js$",
  coverageDirectory: "coverage/integration_test_coverage",
};
