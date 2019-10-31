const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';
const reporters = !process.env.DO_NOT_PRINT_COVERAGE ? ["json", "text"] : ['json'];

module.exports = {
  rootDir: `../${test_target}`,
  testRegex: `\\.test\\.js$`,
  testEnvironment: 'node',
  coverageDirectory: "../coverage/unit_test_coverage",
  coverageReporters: reporters,
};