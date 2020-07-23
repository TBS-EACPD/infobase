import { connect_db } from "../src/db_utils/connect_db";
import { get_templates } from "../src/template_utils";
import { make_mongoose_model_from_original_template } from "../src/db_utils/log_email_and_meta_to_db";
import _ from "lodash";
import fs from "fs";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const json2csv_parser = new Parser();

connect_db()
  .then(() => {
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

      collection.find({}, function (err, email_logs) {
        if (err) {
          console.log(err);
        }
        const column_names = _.chain(collection.schema.paths)
          .keys()
          .filter((key) => {
            return key !== "__v";
          })
          .map((key) => {
            const key_split = key.split(".");
            return key_split.length > 1 ? key_split[1] : key;
          })
          .value();

        const flattened_email_logs = _.map(email_logs, function (sub) {
          return _.reduce(
            sub._doc,
            function (result, email_log_field, key) {
              if (key === "__v") {
                return result;
              }
              if (_.isPlainObject(email_log_field)) {
                return { ...result, ...email_log_field };
              } else if (_.isArray(email_log_field)) {
                return { ...result, [key]: email_log_field.join(", ") };
              } else {
                return { ...result, [key]: email_log_field };
              }
            },
            {}
          );
        });

        const time_corrected_email_logs = _.map(flattened_email_logs, function (
          sub
        ) {
          return {
            ...sub,
            server_time: new Date(sub["server_time"])
              .toUTCString()
              .replace(/,/g, ""),
          };
        });

        if (time_corrected_email_logs.length > 0) {
          const csv = json2csv_parser.parse(time_corrected_email_logs, {
            fields: column_names,
          });

          const file_name = `${template_name}_emails_${new Date().getTime()}.csv`;
          fs.writeFile(`./data_management/CSVs/${file_name}`, csv, function (
            err
          ) {
            console.log(err || `Successfully saved ${file_name}.`);
          });
        }

        templates_left--;
        if (templates_left === 0) {
          mongoose.connection.close();
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
