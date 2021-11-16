const { common_config_rules } = require("./common_config");

// TODO, these will need to run additional pre-test setup for the global systems like text_maker+handlebars, etc
// will need to overwrite at least some moduleNameMapper empty mock targets with custom loaders, .interop.scss will
// be a challenge (might need to rework that system itself)

module.exports = {
  ...common_config_rules,

  testRegex: "\\.integration-test\\.(js|ts|tsx)$",
  coverageDirectory: "<rootDir>/coverage/integration_tests",
  cacheDirectory: "<rootDir>/.cache/jest/integration_tests",
};
