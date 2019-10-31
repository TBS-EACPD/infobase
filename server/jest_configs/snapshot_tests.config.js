const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';

module.exports = {
  rootDir: `../${test_target}`,
  setupTestFrameworkScriptFile: './snapshot_tests_setup.js',
  testRegex: `\\.snapshot_tests\\.js$`,
  testEnvironment: 'node',
  coverageDirectory: "../coverage/snapshot_test_coverage",
  coverageReporters: ["json", "text"],
};