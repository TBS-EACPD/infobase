#!/usr/bin/env node
const fs = require("fs-extra");
const yargs = require("yargs");
const { createCoverageMap } = require("istanbul-lib-coverage");
const { createReporter, config } = require("istanbul-api");

function main() {
  // Original based on https://github.com/facebook/jest/issues/2418#issuecomment-478932514

  const argv = yargs.options({
    report: {
      type: "array", // array of path strings
      desc: "Paths of json coverage report files",
      demandOption: true,
    },
    reporters: {
      type: "array",
      default: ["json", "text"],
    },
  }).argv;

  const { report: report_files, reporters } = argv;

  const map = createCoverageMap({});
  report_files.forEach((file) => {
    const r = fs.readJsonSync(file);
    map.merge(r);
  });

  // first arg is the config (false sets it to default), second is an overwrites object
  const report_config = config.loadFile(false, {
    reporting: {
      "report-config": {
        text: { file: "coverage-final.txt" },
      },
    },
  });

  const reporter = createReporter(report_config);
  reporter.addAll(reporters);
  reporter.write(map);
  console.log("Created merged coverage report(s) in ./coverage/"); // eslint-disable-line no-console
}

try {
  main();
} catch (err) {
  console.error(err); // eslint-disable-line no-console
  process.exit(1); // eslint-disable-line no-process-exit
}
