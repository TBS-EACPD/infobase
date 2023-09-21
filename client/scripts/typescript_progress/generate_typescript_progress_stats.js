/*

This script is to be run in the client/ dir and requires a dependencies.json file to be created by dep-cruiser:

1. npm install --global dependency-cruiser
2. from /client, node scripts/typescript_progress/generate_typescript_progress_stats.js
3. open up scripts/typescript_progress/typescript_progress_stats.csv, give it a quick check and paste it in a NEW sheet on the google drive document. Name the sheet based on today's date.
  - new sheet is recommended because pasting it over the existing sheet might remove important existing metadata of who's working on what. We could periodically delete old sheets.

*/

const { execSync } = require("child_process");
const fs = require("fs");

const d3_dsv = require("d3-dsv");
const _ = require("lodash");

fs.mkdirSync(`${__dirname}/output`, { recursive: true });

execSync(
  `depcruise -T json -f ${__dirname}/output/dependencies.json --webpack-config ${__dirname}/webpack-config-standin.json --ts-config tsconfig.json --exclude node_modules/ src/`
);

const excludedRe = /\.yaml|\.scss|\.css|\.csv/;
const isJavaScriptRe = /\.js/;

const recordsByName = {};

const called = {};
const getAllDeps = _.memoize(function (fileName) {
  if (called[fileName]) {
    return new Set(["CIRCULAR"]);
  }
  called[fileName] = true;
  const entry = recordsByName[fileName];
  const children = entry.dependencies;
  const descendants = _.flatMap(children, (child) =>
    Array.from(getAllDeps(child.source))
  );
  return new Set([...children.map((c) => c.source), ...descendants]);
}, _.identity);

const file = fs
  .readFileSync(`${__dirname}/output/dependencies.json`)
  .toString();
const json = JSON.parse(file);
json.modules.forEach((node) => {
  if (node.source.match(excludedRe)) {
    return;
  }
  node.dependencies = node.dependencies
    .reject((dep) => dep.resolved.match(excludedRe))
    .map((dep) => ({ ...dep, source: dep.resolved }));

  recordsByName[node.source] = node;
});

const final = _.chain(recordsByName)
  .map((node) => {
    const name = node.source;
    const allDeps = Array.from(getAllDeps(node.source));
    const nonTsDeps = allDeps.filter((name) => name.match(isJavaScriptRe));
    return {
      name,
      isTs: !name.match(isJavaScriptRe),
      numDeps: allDeps.length,
      numNonTsDept: nonTsDeps.length,
    };
  })
  .sortBy("name")
  .value();

fs.writeFileSync(
  `${__dirname}/output/typescript_progress_stats.csv`,
  d3_dsv.csvFormat(final)
);
