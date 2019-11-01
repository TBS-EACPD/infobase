// From https://github.com/facebook/jest/issues/2418#issuecomment-478932514

import * as fs from 'fs-extra';
import * as yargs from 'yargs';
import { createCoverageMap, createCoverageSummary } from 'istanbul-lib-coverage';
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
        default: ['json', 'text'],
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


  const summary = createCoverageSummary();
  map.files().forEach(function(file) {
    const file_coverage = map.fileCoverageFor(file);
    const coverage_summary = file_coverage.toSummary();
    summary.merge(coverage_summary);
  });

  const coverage_percent = Math.round(summary.data.lines.pct);

  const coverage_status_color = ( () => {
    if (coverage_percent >= 80) {
      return '#4c1';
    } else if (coverage_percent >= 50) {
      return '#dfb317';
    } else {
      return '#e05d44';
    }
  })(); 

  fs.writeFileSync(
    './coverage/coverage-shield-badge.svg',
    `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="138" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="138" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <path fill="#555" d="M0 0h95v20H0z"/>
    <path fill="${coverage_status_color}" d="M95 0h43v20H95z"/>
    <path fill="url(#b)" d="M0 0h138v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text x="485" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="850">
      Coverage
    </text>
    <text x="485" y="140" transform="scale(.1)" textLength="850">
      Coverage
    </text>
    <text x="1155" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="330">
      ${coverage_percent}%
    </text>
    <text x="1155" y="140" transform="scale(.1)" textLength="330">
      ${coverage_percent}%
    </text>
  </g>
</svg>`
  );

  console.log('Created a coverage shield-badge in ./coverage'); // eslint-disable-line no-console
}