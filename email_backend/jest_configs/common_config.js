const src_to_test = !process.env.TEST_AGAINST_TRANSPILIED
  ? "src"
  : "transpiled_build";
const src_to_ignore = process.env.TEST_AGAINST_TRANSPILIED
  ? "src"
  : "transpiled_build";

const reporters = !process.env.DO_NOT_PRINT_COVERAGE
  ? ["json", "text"]
  : ["json"];

module.exports = {
  rootDir: "../",
  modulePathIgnorePatterns: [src_to_ignore],
  coverageReporters: reporters,
  collectCoverageFrom: [`<rootDir>/${src_to_test}/**/*.js`],
  coveragePathIgnorePatterns: [
    "\\.unit-test\\.js$",
    "\\.end-to-end-test\\.js$",
    "\\.integration-test\\.js$",
    "index\\.js",
  ],
  testEnvironment: "node",
};
