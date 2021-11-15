const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

const code_suffix_pattern = "\\.(js|ts|tsx)$";

module.exports = {
  common_config_rules: {
    rootDir: "..",
    moduleDirectories: ["<rootDir>", "<rootDir>/node_modules"],
    setupFilesAfterEnv: ["<rootDir>/jest_configs/utils/common_test_setup.js"],
    moduleNameMapper: {
      // TODO .interop.scss is going to need an exception (and maybe a rework to be test-friendly)
      "\\.(css|scss|yaml|csv|svg)$":
        "<rootDir>/jest_configs/utils/empty_mock.js",
    },
    transform: {
      [code_suffix_pattern]: [
        "babel-jest",
        { configFile: "./jest_configs/babel-jest.config.js" },
      ],
      //"^.+\\.yaml$": "./src/testing/yaml-lang-transform.js",
      //"^.+\\.csv$": "./src/testing/raw-transform.js",
      ////Note that webpack's svg-inline-loader applies minor transformations, let's hope they don't matter to tests, though
      //"^.+\\.(csv|svg)$": "./src/testing/raw-transform.js",
    },

    coverageReporters: reporters,
    collectCoverageFrom: [
      "<rootDir>/src/**/*.{js,ts,tsx}",
      "!<rootDir>/src/**/*.d.ts",
    ],
    coveragePathIgnorePatterns: [
      "\\.unit-test",
      "\\.end-to-end-test",
      "\\.integration-test",
      //"index", // TODO, we have some rascally "index" files that add new code, need to make sure those are cleaned up before we can ignore them whole sale
    ].map((pre_suffix) => pre_suffix + code_suffix_pattern),
  },
};
