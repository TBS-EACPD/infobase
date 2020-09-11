/* eslint-disable no-console */
const fs = require("fs");

const _ = require("lodash");
const rimraf = require("rimraf");
const createTestCafe = require("testcafe");
const yargs = require("yargs");

const { route_load_tests_config } = require("./route-load-tests-config.js");

const get_options_from_args = () => {
  const argv = yargs
    .options("browser", {
      alias: "b",
      description: "Browsers to test with. Options are {chrome, chromium}",
      type: "array",
      default: ["chrome"],
    })
    .option("sandbox", {
      alias: "s",
      description: "Sandbox browser",
      type: "boolean",
      default: true,
    })
    .option("headless", {
      alias: "hl",
      description: "Run browser in headless mode",
      type: "boolean",
      default: true,
    })
    .option("concurrency", {
      alias: "c",
      description: "Testcafe browser concurrency",
      type: "number",
      default: 2,
    })
    .help()
    .alias("help", "h").argv;

  return {
    chrome: _.includes(argv.browser, "chrome"),
    chromium: _.includes(argv.browser, "chromium"),
    no_sandbox: !argv.sandbox,
    headless: argv.headless,
    concurrency: argv.concurrency,
  };
};

const test_configs_from_route_config = (route_config) =>
  _.map(route_config.test_on, (app) => ({
    app,
    ...route_config,
  }));
const test_config_to_test_file_object = ({
  app,
  name,
  route,
  expect_to_fail,
}) => ({
  file_name: `${app}-${_.kebabCase(name)}-test-expect-${
    expect_to_fail ? "failure" : "success"
  }.js`,
  js_string: `
import { Selector } from 'testcafe';

fixture \`${app}\`
  .page \`http://localhost:8080/build/InfoBase/index-${app}.html#${route}\`;

test(
  "${name} route loads ${
    expect_to_fail ? "WITH" : "without"
  } error (route: index-${app}.html#${route})", 
  async test_controller => {
    // Checks that the route loads anying (appends any children to the #app element), that the spinner eventually ends, and that the post-spinner page isn't the error page
    await test_controller.expect( Selector('#app').childElementCount ).notEql( 0, {timeout: 20000} )
      .expect( Selector('.spinner').exists ).notOk( {timeout: 20000} )
      ${
        (!expect_to_fail &&
          ".expect( Selector('#error-boundary-icon').exists ).notOk()") ||
        ""
      }
      .wait(1000) // a few errors, such as a missing glossary key, can occur slightly after the page's initial loading appears to have passed, wait and double check for better coverage
      .expect( Selector('#error-boundary-icon').exists ).${
        expect_to_fail ? "ok" : "notOk"
      }()
  }
);`,
});

const handle_error = (e) => {
  process.exitCode = 1;
  console.log(e);
};

const run_tests = (test_dir, options) => {
  let testcafe = null;
  return createTestCafe()
    .then((tc) => {
      testcafe = tc;
      const runner = testcafe.createRunner();

      const test_files = fs
        .readdirSync(test_dir)
        .map((file_name) => `${test_dir}/${file_name}`);

      const { negative_tests, positive_tests } = _.groupBy(
        test_files,
        (file_name) =>
          /expect-failure.js$/.test(file_name)
            ? "negative_tests"
            : "positive_tests"
      );

      const browser_options = `${options.headless ? ":headless" : ""}${
        options.no_sandbox ? " --no-sandbox" : ""
      }`;

      const browsers = _.filter([
        options.chrome && `chrome${browser_options}`,
        options.chromium && `chromium${browser_options}`,
      ]);

      // First test that an erroring page actually hits the error boundary, else the other tests will fail positive
      const test_negative_routes = () =>
        runner
          .src(negative_tests)
          .browsers(browsers)
          .concurrency(options.concurrency)
          .reporter("spec") // the default testcafe reporter, sending to stdout by default
          .run({ skipJsErrors: true }); // ignore JS errors when testing that failing routes fail, they're expected

      const test_positive_routes = () =>
        runner
          .src(positive_tests)
          .browsers(browsers)
          .concurrency(options.concurrency)
          .reporter("spec")
          .run();

      return test_negative_routes().then((negative_failing_count) =>
        test_positive_routes().then(
          (positive_failing_count) =>
            negative_failing_count + positive_failing_count
        )
      );
    })
    .then((failed_count) => {
      if (failed_count > 0) {
        // Just setting an error exit code here was flaky in CI, so this event forces the exit code to be an error when any test have failed
        // Using an on exit event handler to allow node to, otherwise, exit gracefully ( explicitly calling exit here could stomp stdout logging, etc.)
        process.on("exit", () => process.exit(1));
      }
    })
    .catch(handle_error)
    .finally(() => {
      !_.isNull(testcafe) && testcafe.close();
      test_dir && rimraf.sync(test_dir);
    });
};

const route_load_tests = (config) => {
  const options = get_options_from_args();

  // Make a temp directory to hold the test files to be generated from the config
  const temp_dir = fs.mkdtempSync("browser-tests/temp-route-tests-");

  console.log("\n  Generating route test files from config...\n");

  // Could have a lot of files to write, so doing it async while the config's being parsed
  const test_file_write_promises = _.flatMap(config, (route_level_config) => {
    const test_file_objects = _.chain(route_level_config)
      .thru(test_configs_from_route_config)
      .map(test_config_to_test_file_object)
      .value();

    const test_file_write_promises_for_route = _.map(
      test_file_objects,
      (test_file_object) =>
        new Promise((resolve, reject) => {
          fs.writeFile(
            `${temp_dir}/${test_file_object.file_name}`,
            test_file_object.js_string,
            "utf8",
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`    ${test_file_object.file_name}`);
                resolve();
              }
            }
          );
        })
    );

    return test_file_write_promises_for_route;
  });

  Promise.all(test_file_write_promises)
    .then(() => {
      console.log("\n  ... done generating tests \n\n");

      // Run all tests in temp_dir, test report sent to stdout
      run_tests(temp_dir, options);
    })
    .catch(handle_error);
};

try {
  route_load_tests(route_load_tests_config);
} catch (e) {
  handle_error(e);
}
