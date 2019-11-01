// From https://github.com/facebook/jest/issues/2418#issuecomment-478932514

import * as fs from 'fs-extra';
import * as yargs from 'yargs';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createReporter } from 'istanbul-api';

main().catch(err => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1); // eslint-disable-line no-process-exit
});

async function main(){
  const argv = yargs
    .options({
      report: {
        type: 'array', // array of string
        desc: 'Path of json coverage report file',
        demandOption: true,
      },
      reporters: {
        type: 'array',
        default: ['json', 'lcov'],
      },
    })
    .argv;

  const reportFiles = argv.report;
  const reporters = argv.reporters;

  const map = createCoverageMap({});

  reportFiles.forEach(file => {
    const r = fs.readJsonSync(file);
    map.merge(r);
  });

  const reporter = createReporter();
  reporter.addAll(reporters);
  reporter.write(map);
  console.log('Created a merged coverage report in ./coverage'); // eslint-disable-line no-console
}