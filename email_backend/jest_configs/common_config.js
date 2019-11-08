const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';
const reporters = !process.env.DO_NOT_PRINT_COVERAGE ? ["json", "text"] : ['json'];

module.exports = {
  rootDir: `../${test_target}`,
  coverageReporters: reporters,
  collectCoverageFrom: ['<rootDir>/**/*.js'],
  coveragePathIgnorePatterns: [
    '\\.unit-test\\.js$',
    '\\.end-to-end-test\\.js$',
    'index\\.js',
  ],
  testEnvironment: 'node',
};