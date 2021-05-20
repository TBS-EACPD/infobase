/*

This script is to be run in the client/ dir and requires a dependencies.json file to be created by dep-cruiser:

1. npm install --global dependency-cruiser
2. depcruise -T json -f dependencies.json --exclude node_modules/  src/
3. node generate_typescript_progress_stats.js
4. open up typescript_progress_stats.csv, give it a quick check and paste it in a NEW sheet on the google drive document. Name the sheet based on today's date.
  - new sheet is recommended because pasting it over the existing sheet might remove important existing metadata of who's working on what. We could periodically delete old sheets.

*/

const fs = require("fs");

const _ = require("lodash");

const excludedRe = /\.yaml|\.scss|\.css|\.csv/;
const isTypescriptRe = /\.ts|\.tsx/;
const d3_dsv = require("d3-dsv");

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

const file = fs.readFileSync("./dependencies.json").toString();
const json = JSON.parse(file);
json.modules.forEach((node) => {
  if (node.source.match(excludedRe)) {
    return;
  }
  node.dependencies = node.dependencies
    .filter((dep) => !dep.resolved.match(excludedRe))
    .map((dep) => ({ ...dep, source: dep.resolved }));

  recordsByName[node.source] = node;
});

const final = _.chain(recordsByName)
  .map((node) => {
    const name = node.source;
    const allDeps = Array.from(getAllDeps(node.source));
    const nonTsDeps = allDeps.filter((name) => !name.match(isTypescriptRe));
    return {
      name,
      isTs: !!name.match(isTypescriptRe),
      numDeps: allDeps.length,
      numNonTsDept: nonTsDeps.length,
    };
  })
  .sortBy("name")
  .value();

fs.writeFileSync("./typescript_progress_stats.csv", d3_dsv.csvFormat(final));
