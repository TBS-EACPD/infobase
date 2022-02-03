const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

export const common_config_rules = {
  rootDir: "..",
  testPathIgnorePatterns: ["transpiled_build"],

  coverageReporters: reporters,
  collectCoverageFrom: ["<rootDir>/src/**/*.js"],
  coveragePathIgnorePatterns: [
    "\\.unit-test\\.js$",
    "\\.snapshot-test\\.js$",
    "-donttest\\.js$",
    "index\\.js",
    "snapshot_tests_setup.js",
  ],
  testEnvironment: "node",
};
