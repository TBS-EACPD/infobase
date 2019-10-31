const test_target = !process.env.TEST_AGAINST_TRANSPILIED ? 'src' : 'transpiled_build';

module.exports = {
  all: true,
  include: [`${test_target}/**/*.js`],
  exclude: ['**/index.js', '**/*.unit-test.js', '**/*.snapshot-test.js', `**/*.config.js`],
  clean: false,
  silent: true,
};