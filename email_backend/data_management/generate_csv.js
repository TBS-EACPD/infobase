const fs = require("fs");
const _ = require("lodash");
const json = JSON.parse(
  fs.readFileSync("./data_management/email_data.json", "utf8")
);
const csv_format = [
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
      if (key === "__v") {
        return result;
      }
      if (_.isPlainObject(value)) {
        return { ...result, ...value };
      } else if (_.isArray(value)) {
        result[key] = value.join(" & ");
      } else {
        result[key] = value;
      }
      return result;
    },
    {}
  );
});

_.map(reduced_json, function (report) {
  report["server_time"] = new Date(report["server_time"]).toUTCString();
  csv_format.push(_.values(report));
});

const csv = _.map(csv_format, function (format) {
  return format.join(",");
});

fs.writeFile("./data_management/email_data.csv", csv.join("\r\n"), function (
  err
) {
  console.log(err || "Successfully Saved.");
});
