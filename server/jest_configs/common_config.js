const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

export const common_config_rules = {
  // jest tries to spawn # threads - 1 workers, which can lead to it starving itself in CI where it detects way more threads than it can actually use
  ...(process.env.CIRCLECI && { maxWorkers: 4 }),

  rootDir: "..",

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
