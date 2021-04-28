const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

export const common_config_rules = {
  rootDir: "../",
  coverageReporters: reporters,
  collectCoverageFrom: [`<rootDir>/src/**/*.js`],
  coveragePathIgnorePatterns: [
    "\\.unit-test\\.js$",
    "\\.end-to-end-test\\.js$",
    "\\.integration-test\\.js$",
    "index\\.js",
  ],
  testEnvironment: "node",
};
