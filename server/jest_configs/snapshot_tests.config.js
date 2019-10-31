const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';
const reporters = !process.env.DO_NOT_PRINT_COVERAGE ? ["json", "text"] : ['json'];

module.exports = {
  rootDir: `../${test_target}`,
  setupTestFrameworkScriptFile: './snapshot_tests_setup.js',
  testRegex: `\\.snapshot-test\\.js$`,
  testEnvironment: 'node',
  coverageDirectory: "../coverage/snapshot_test_coverage",
  coverageReporters: reporters,
};