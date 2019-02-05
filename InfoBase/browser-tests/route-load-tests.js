/* eslint-disable no-console */
const _ = require("lodash");
const fs = require("fs");
const createTestCafe = require('testcafe');
const rimraf = require("rimraf");

const { route_load_tests_config } = require('./route-load-tests-config.js');


const route_load_tests = (config) => {
  const args = process.argv;
  const options = get_options_from_args(args);

  // Make a temp directory to hold the test files to be generated from the config 
  const temp_dir = fs.mkdtempSync('browser-tests/temp-route-tests-');

  console.log('\n  Generating route test files from config...\n');

  // Could have a lot of files to write, so doing it async while the config's being parsed
  const test_file_write_promises = _.flatMap(
    config, 
    route_level_config => {
      const test_file_objects = _.chain(route_level_config)
        .thru( test_configs_from_route_config )
        .map( test_config_to_test_file_object )
        .value();

      const test_file_write_promises_for_route = _.map(
        test_file_objects,
        test_file_object => new Promise(
          (resolve, reject) => {
            fs.writeFile(
              `${temp_dir}/${test_file_object.file_name}`, 
              test_file_object.js_string, 
              'utf8',
              (err) => {
                if (err){
                  reject(err);
                } else {
                  console.log(`    ${test_file_object.file_name}`);
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

  Promise
    .all(test_file_write_promises)
    .then( 
      () => {
        console.log('\n  ... done generating tests \n\n');

        // Run all tests in temp_dir, test report sent to stdout
        run_tests(temp_dir, options);
      }
    )
    .catch( handle_error );
};


const get_options_from_args = (args) => {
  const arg_options = {
    chrome: !!choose(args, 'CHROME'),
    chromium: !!choose(args, 'CHROMIUM'),
    no_sandbox: !!choose(args, 'NO_SANDBOX'),
    headless: !!choose(args, 'HEADLESS'),
  };

  // If neither browser option passed, defaults to chrome
  if ( !arg_options.chrome && !arg_options.chromium ){
    return {
      ...arg_options,
      chrome: true,
    };
  } else {
    return arg_options;
  }
};
const choose = (args, arg_name) => (args.indexOf(arg_name) > -1) && arg_name;

const test_configs_from_route_config = (route_config) => _.map(
  route_config.test_on,
  app => ({
    name: route_config.name,
    route: route_config.route,
    app,
  })
);

const test_config_to_test_file_object = (test_config) => ({
  file_name: `${test_config.app}-${_.kebabCase(test_config.name)}-test.js`,
  js_string: `
import { Selector } from 'testcafe';

fixture \`${test_config.app}\`
  .page \`http://localhost:8080/build/InfoBase/index-${test_config.app}.html#${test_config.route}\`;

test(
  '${test_config.name} route loads without error', 
  async test_controller => {
    // Checks that the route loads anying (appends any children to the #app element), that the spinner eventually ends, and that the post-spinner page isn't the error page
    await test_controller.expect( Selector('#app').childElementCount ).notEql( 0, {timeout: 20000} )
      .expect( Selector('.spinner').exists ).notOk( {timeout: 20000} )
      .expect( Selector('#error-boundary-icon').exists ).notOk();
  }
);`,
});

const run_tests = (test_dir, options) => {
  let testcafe = null;
  return createTestCafe()
    .then(
      tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();

        const test_files = fs
          .readdirSync(test_dir)
          .map( file_name => `${test_dir}/${file_name}`);

        const browser_options = `${options.headless ? ':headless' : ''}${options.no_sandbox ? ' --no-sandbox' : ''}`;

        return runner
          .src(test_files)
          .browsers( 
            _.filter([
              options.chrome && `chrome${browser_options}`, 
              options.chromium && `chromium${browser_options}`,
            ])
          )
          .concurrency(2)
          .reporter('spec') // the default testcafe reporter, sending to stdout by default
          .run();
      }
    )
    .then( (failed_count) => {
      if (failed_count){
        // Just setting an error exit code here was flaky in CI, so this event forces the exit code to be an error when any test have failed
        // Using an on exit event handler to allow node to, otherwise, exit gracefully ( explicitly calling exit here could stomp stdout logging, etc.)
        process.on( 'exit', () => process.exit(1) );
      }
    })
    .catch( handle_error )
    .finally( () => {
      !_.isNull(testcafe) && testcafe.close();
      test_dir && rimraf.sync(test_dir);
    });
};

const handle_error = (e) => {
  process.exitCode = 1;
  console.log(e);
}


try {
  route_load_tests(route_load_tests_config);
} catch (e) {
  handle_error(e);
}