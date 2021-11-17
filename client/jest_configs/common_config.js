const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

const code_suffix_pattern = "\\.(js|ts|tsx)$";

module.exports = {
  common_config_rules: {
    rootDir: "..",
    moduleDirectories: ["<rootDir>", "<rootDir>/node_modules"],
    moduleNameMapper: {
      "\\.(css|scss|yaml)$": "<rootDir>/jest_configs/utils/empty_mock.js",
    },

    setupFilesAfterEnv: ["<rootDir>/jest_configs/utils/common_test_setup.js"],

    coverageReporters: reporters,
    collectCoverageFrom: [
      "<rootDir>/src/**/*.{js,ts,tsx}",
      "!<rootDir>/src/**/*.d.ts",
    ],
    coveragePathIgnorePatterns: [
      "\\.unit-test",
      "\\.integration-test",
      //"index", // TODO, we have some rascally "index" files that DO include code that should be tested, need to identify and split that out before ignoring them
    ].map((pre_suffix) => pre_suffix + code_suffix_pattern),
  },
};
