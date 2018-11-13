/* eslint-disable no-console */
const fs = require("fs");
const path = require('path');
const os = require('os');
const _ = require("lodash");
const createTestCafe = require('testcafe');

const route_load_tests_config = require('./route-load-tests-config.js');


const route_load_tests = (config) => {
  const args = process.argv;
  const options = get_options_from_args(args);

  // Make a temp directory to hold the test files to be generated from the config 
  const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'route-tests-'));


  // Run all tests in temp_dir, test report sent to stdout
  run_tests(temp_dir, options);
} 


const get_options_from_args = (args) => ({
  run_optional_tests: !!choose(args, 'RUN_OPTIONAL'),
  chrome: !!choose(args, 'CHROME'),
  chromium: !!choose(args, 'CHROMIUM'),
  headless: !!choose(args, 'HEADLESS'),
});
const choose = (args, arg_name) => (args.indexOf(arg_name) > -1) && arg_name;



const run_tests = (test_dir, options) => {
  let testcafe = null;
  createTestCafe('localhost', 8080)
    .then(
      tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();
    
        return runner
          .src(test_dir)
          .browsers( 
            _.filter([
              options.chrome && `chrome${options.headless ? ':headless' : ''}`, 
              options.chromium && `chromium${options.headless ? ':headless' : ''} --no-sandbox`,
            ])
          )
          .reporter('spec') // the default testcafe reporter, sending to stdout
          .run();
      }
    )
    .finally( 
      () => {
        !_.isNull(testcafe) && testcafe.close();
        test_dir && fs.rmdir(test_dir);
      } 
    );
};


route_load_tests(route_load_tests_config);