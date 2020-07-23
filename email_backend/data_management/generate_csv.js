import { connect_db } from "../src/db_utils/connect_db";
import { get_templates } from "../src/template_utils";
import { make_mongoose_model_from_original_template } from "../src/db_utils/log_email_and_meta_to_db";
import _ from "lodash";
import fs from "fs";
import mongoose from "mongoose";
connect_db().then(() => {
  const templates = get_templates();
  let templates_left = _.keys(templates).length;
  _.forEach(templates, (template_value, template_name) => {
    const collection = make_mongoose_model_from_original_template({
      original_template: template_value,
      template_name,
    });

    //if it happens that later on we add another key with a json value,
    //change reduced json to handle "key.value". For the time being, the CSV
    //will be cleaner if we flatten the "key.value" to "value"

    collection.find({}, function (err, submissions) {
      if (err) {
        console.log(err);
      }
      const column_names = _.chain(_.keys(collection.schema.paths))
        .filter((key) => {
          return key !== "__v";
        })
        .map((key) => {
          const key_split = key.split(".");
          return key_split.length > 1 ? key_split[1] : key;
        })
        .value();

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
              result[key] = value.join(", ");
            } else {
              result[key] = value;
            }
            return result;
          },
          {}
        );
      });

      const time_fixed_json = _.map(reduced_json, function (report) {
        report["server_time"] = new Date(report["server_time"])
          .toUTCString()
          .replace(/,/g, "");
        return report;
      });

      const csv_format = _.concat(
        [column_names],
        _.map(time_fixed_json, (submission) => {
          return _.map(column_names, (key) => {
            return _.has(submission, key) ? submission[key] : "";
          });
        })
      );

      const csv = _.map(csv_format, function (format) {
        return format.join(",");
      });

      fs.writeFile(
        `./data_management/CSVs/${template_name}_emails.csv`,
        csv.join("\r\n"),
        function (err) {
          console.log(err || "Successfully Saved.");
          templates_left--;
          if (templates_left === 0) {
            mongoose.connection.close();
          }
        }
      );
    });
  });
});
