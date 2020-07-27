import { connect_db } from "../src/db_utils/connect_db";
import { get_templates } from "../src/template_utils";
import { make_mongoose_model_from_original_template } from "../src/db_utils/log_email_and_meta_to_db";
import _ from "lodash";
import fs from "fs";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const json2csv_parser = new Parser();

const templates = get_templates();
connect_db()
  .then(() =>
    _.chain(templates)
      .map((template_value, template_name) => {
        return make_mongoose_model_from_original_template({
          original_template: template_value,
          template_name,
        });
      })
      .map((model) => model.find({}).exec())
      .thru((promises) => Promise.all(promises))
      .value()
  )
  .then((all_email_logs) => {
    //if it happens that later on we add another key with a json value,
    //change reduced json to handle "key.value". For the time being, the CSV
    //will be cleaner if we flatten the "key.value" to "value"
    _.forEach(all_email_logs, (collection, index) => {
      if (collection.length > 0) {
        const template_name = _.keys(templates)[index];

        const flattened_email_logs = _.map(collection, function (sub) {
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

        const column_names = _.keys(flattened_email_logs[0]);

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
      }
    });
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    mongoose.connection.close();
  });
