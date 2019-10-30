const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';

module.exports = {
  testRegex: `${test_target}\\/.+\\.test\\.js$`,
  testEnvironment: 'node',
};