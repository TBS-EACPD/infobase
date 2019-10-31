const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';

module.exports = {
  rootDir: `../${test_target}`,
  testRegex: `\\.test\\.js$`,
  testEnvironment: 'node',
  coverageDirectory: "../coverage/unit_test_coverage",
  coverageReporters: ["json", "text"],
};