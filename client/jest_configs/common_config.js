const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

const code_suffix_pattern = "\\.(js|ts|tsx)$";

module.exports = {
  common_config_rules: {
    rootDir: "..",
    modulePaths: ["<rootDir>"],

    moduleNameMapper: {
      "\\.(css|scss|yaml)$": "<rootDir>/jest_configs/utils/empty_mock.js",
    },

    coverageReporters: reporters,
    collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts,tsx}"],
    coveragePathIgnorePatterns: [
      `.*\\.unit-test${code_suffix_pattern}`,
      `.*\\.integration-test${code_suffix_pattern}`,
      `.*\\.stories.tsx`,
      ".*\\.d\\.ts$",
    ],

    testEnvironment: "jsdom",

    setupFilesAfterEnv: ["<rootDir>/jest_configs/utils/common_test_setup.js"],
  },
};
