const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';

module.exports = {
  setupTestFrameworkScriptFile: `./${test_target}/snapshot_tests_setup.js`,
  testRegex: `${test_target}\\/.+\\.snapshot_tests\\.js$`,
  testEnvironment: 'node',
};