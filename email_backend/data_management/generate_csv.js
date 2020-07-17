const fs = require("fs");
const _ = require("lodash");
var json = JSON.parse(fs.readFileSync("email_data.json", "utf8"));

_.map(json, function (report) {
  console.log(report);
});
