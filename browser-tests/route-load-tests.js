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
  const temp_dir = fs.mkdtempSync( path.join( os.tmpdir(), 'route-tests-' ) );

  console.log('\n  Generating route test files from config...');

  // Could have a lot of files to write, so doing it async while the config's being parsed
  const test_file_write_promises = _.flatMap(
    config, 
    route_level_config => {
      const test_file_objects = _.chain(route_level_config)
        .thru( test_configs_from_route_config )
        .filter( test_config => options.run_optional_tests || !test_is_optional(test_config) )
        .map( test_config_to_test_file_object )
        .value();

      const test_file_write_promises_for_route = _.map(
        test_file_objects,
        test_file_object => new Promise(
          (resolve, reject) => {
            fs.writeFile(
              `${temp_dir}/${test_file_object.name}`, 
              test_file_object.js_string, 
              'utf8',
              (err) => {
                if (err){
                  reject(err);
                } else {
                  console.log(`\n    ${test_file_object.name}`);
                  resolve();
                }
              }
            );
          }
        )
      );

      return test_file_write_promises_for_route;
    }
  );

  Promise.all(test_file_write_promises).then( () => {
    console.log('\n  ... done generating tests \n\n');

    // Run all tests in temp_dir, test report sent to stdout
    run_tests(temp_dir, options);
  });
} 


const get_options_from_args = (args) => ({
  run_optional_tests: !!choose(args, 'RUN_OPTIONAL'),
  chrome: !!choose(args, 'CHROME'),
  chromium: !!choose(args, 'CHROMIUM'),
  no_sandbox: !!choose(args, 'BROWSER_NO_SANDBOX'),
  headless: !!choose(args, 'HEADLESS'),
});
const choose = (args, arg_name) => (args.indexOf(arg_name) > -1) && arg_name;

const test_configs_from_route_config = (route_config) => []; // TODO

const test_is_optional = (test_config) => false; // TODO

const test_config_to_test_file_object = (test_config) => {}; // TODO

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
              options.chrome && `chrome${options.headless ? ':headless' : ''}${options.no_sandbox ? ' --no-sandbox' : ''}`, 
              options.chromium && `chromium${options.headless ? ':headless' : ''}${options.no_sandbox ? ' --no-sandbox' : ''}`,
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