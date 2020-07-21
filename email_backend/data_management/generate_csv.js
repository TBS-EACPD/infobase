// const fs = require("fs");
// const _ = require("lodash");
// const json = JSON.parse(
//   fs.readFileSync("./data_management/email_data.json", "utf8")
// );
// const csv_format = [
//   [
//     "ID",
//     "Issue types",
//     "Issue Details",
//     "Commit SHA",
//     "Route",
//     "Language",
//     "App Version",
//     "Client ID",
//     "Recipient",
//     "Sender",
//     "Referer",
//     "Server Time",
//     "Date",
//     "Time",
//   ],
// ];

// const reduced_json = _.map(json, function (report) {
//   return _.reduce(
//     report,
//     function (result, value, key) {
//       if (key === "__v") {
//         return result;
//       }
//       if (_.isPlainObject(value)) {
//         return { ...result, ...value };
//       } else if (_.isArray(value)) {
//         result[key] = value.join(" & ");
//       } else {
//         result[key] = value;
//       }
//       return result;
//     },
//     {}
//   );
// });

// _.map(reduced_json, function (report) {
//   report["server_time"] = new Date(report["server_time"]).toUTCString();
//   csv_format.push(_.values(report));
// });

// const csv = _.map(csv_format, function (format) {
//   return format.join(",");
// });

// fs.writeFile("./data_management/email_data.csv", csv.join("\r\n"), function (
//   err
// ) {
//   console.log(err || "Successfully Saved.");
// });

import { connect_db } from "../transpiled_build/db_utils/connect_db";
import { get_templates } from "../transpiled_build/template_utils";
import { make_mongoose_model_from_original_template } from "../transpiled_build/db_utils/log_email_and_meta_to_db";
import _ from "lodash";
connect_db();
const templates = get_templates();
_.map(templates, (template_value, template_name) => {
  const collection = make_mongoose_model_from_original_template({
    original_template: template_value,
    template_name,
  });

  //if it happens that later on we add another key with a json value,
  //change reduced json to handle "key.value". For the time being, the CSV
  //will be cleaner if we flatten the "key.value" to "value"

  collection.find({}, function (err, submissions) {
    const csv_format = _.map(_.keys(collection.schema.paths), (key) => {
      const key_split = key.split(".");
      return key_split.length > 1 ? key_split[1] : key;
    });
    const csv = [csv_format];

    const reduced_json = _.map(submissions, function (sub) {
      return _.reduce(
        sub._doc,
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

    const time_fixed_json = _.map(reduced_json, function (report) {
      report["server_time"] = new Date(report["server_time"]).toUTCString();
      return report;
    });

    _.map(time_fixed_json, (submission) => {
      csv_format.push(
        _.map(csv_format, (key) => {
          console.log(key);
          return _.has(submission, key) ? submission[key] : "";
        })
      );
    });

    // console.log(csv_format);
  });
});
// const original_template = templates["report_a_problem"];
// const template_name = "report_a_problem";
// const Report = make_mongoose_model_from_original_template({
//   original_template,
//   template_name,
// });

// Report.find({}, function (err, report) {
//   console.log(report);
// });
