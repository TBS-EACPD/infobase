#!/usr/bin/env node
import fs from "fs-extra";
import coverage from "istanbul-lib-coverage";
import yargs from "yargs";

const get_svg_string = (coverage_status_color, coverage_percent) => `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="108" height="20">
<linearGradient id="b" x2="0" y2="100%">
  <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
  <stop offset="1" stop-opacity=".1"/>
</linearGradient>
<clipPath id="a">
  <rect width="108" height="20" rx="3" fill="#fff"/>
</clipPath>
<g clip-path="url(#a)">
  <path fill="#555" d="M0 0h73v20H0z"/>
  <path fill="${coverage_status_color}" d="M73 0h35v20H73z"/>
  <path fill="url(#b)" d="M0 0h108v20H0z"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
  <text x="350" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="600">
    Coverage
  </text>
  <text x="350" y="140" transform="scale(.1)" textLength="600">
    Coverage
  </text>
  <text x="900" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="275">
    ${coverage_percent}%
  </text>
  <text x="900" y="140" transform="scale(.1)" textLength="275">
    ${coverage_percent}%
  </text>
</g>
</svg>`;

function create_coverage_shield_badge() {
  const argv = yargs.options({
    report: {
      type: "string",
      desc: "Path of json coverage report file",
      demandOption: true,
    },
  }).argv;

  const coverage_report_file = fs.readJsonSync(argv.report);
  const map = coverage.createCoverageMap({});
  map.merge(coverage_report_file);

  const coverage_summary = coverage.createCoverageSummary();
  map.files().forEach(function (file) {
    const file_coverage = map.fileCoverageFor(file);
    const file_summary = file_coverage.toSummary();
    coverage_summary.merge(file_summary);
  });

  const coverage_percent = Math.round(coverage_summary.data.lines.pct);

  const coverage_status_color = (() => {
    if (coverage_percent >= 80) {
      return "#4c1";
    } else if (coverage_percent >= 50) {
      return "#dfb317";
    } else {
      return "#e05d44";
    }
  })();

  const shield_badge_svg = get_svg_string(
    coverage_status_color,
    coverage_percent
  );

  console.log(shield_badge_svg); // eslint-disable-line no-console
}

try {
  create_coverage_shield_badge();
} catch (err) {
  console.error(err); // eslint-disable-line no-console
  process.exit(1); // eslint-disable-line no-process-exit
}
