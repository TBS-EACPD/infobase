const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

export const common_config_rules = {
  rootDir: "../src",
  coverageReporters: reporters,
  collectCoverageFrom: ["<rootDir>/**/*.js"],
  coveragePathIgnorePatterns: [
    "\\.unit-test\\.js$",
    "\\.snapshot-test\\.js$",
    "-donttest\\.js$",
    "index\\.js",
    "snapshot_tests_setup.js",
  ],
  testEnvironment: "node",
};
