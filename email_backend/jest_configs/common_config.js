const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

module.exports = {
  rootDir: `./`,
  modulePathIgnorePatterns: [
    "node_modules",
    process.env.TEST_AGAINST_TRANSPILIED ? "src" : "transpiled_build",
  ],
  coverageReporters: reporters,
  collectCoverageFrom: ["<rootDir>/**/*.js"],
  coveragePathIgnorePatterns: [
    "\\.unit-test\\.js$",
    "\\.end-to-end-test\\.js$",
    "index\\.js",
  ],
  testEnvironment: "node",
};
