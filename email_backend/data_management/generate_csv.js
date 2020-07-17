const fs = require("fs");
const _ = require("lodash");
var json = JSON.parse(fs.readFileSync("email_data.json", "utf8"));
const csv = [
  [
    "ID",
    "Issue types",
    "Issue Details",
    "Commit SHA",
    "Route",
    "Language",
    "App Version",
    "Client ID",
    "Recipient",
    "Sender",
    "Referer",
    "Server Time",
    "Date",
    "Time",
  ],
];

const reduced_json = _.map(json, function (report) {
  return _.reduce(
    report,
    function (result, value, key) {
      if (_.isPlainObject(value)) {
        return { ...result, ...value };
      } else {
        result[key] = value;
        return result;
      }
    },
    {}
  );
});

console.log(reduced_json);
