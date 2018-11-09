/* eslint-disable no-console */
const fs = require("fs");
const path = require('path');
const os = require('os');
const _ = require("lodash");
const createTestCafe = require('testcafe');

const route_load_tests_config = require('./route-load-tests-config.js');

const args = process.argv;

function choose(name){
  return (args.indexOf(name) > -1) && name;
}

const run_optional_tests = !!choose('RUN_OPTIONAL');
const headless = !!choose('HEADLESS');
const chrome = !!choose('CHROME');
const chromium = !!choose('CHROMIUM');


const build_dir_name = process.env.BUILD_DIR || "build";

// Make a temp directory to hold the test files generated using route-load-tests-config.json
const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'route-tests-'));





let testcafe = null;
createTestCafe('localhost', 8080)
  .then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();

    return runner
      .src(temp_dir)
      .browsers( 
        _.filter([
          chrome && `chrome${headless ? ':headless' : ''}`, 
          chromium && `chromium${headless ? ':headless' : ''}`,
        ])
      )
      .run();
  })
  .then(failedCount => {
    testcafe.close();
    fs.rmdir(temp_dir);
  });