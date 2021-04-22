import fs from "fs";

import { Parser } from "json2csv";
import _ from "lodash";

import mongoose from "mongoose";

import { connect_db } from "../../src/db_utils/connect_db";
import { make_mongoose_model_from_original_template } from "../../src/db_utils/log_email_and_meta_to_db";
import { get_templates } from "../../src/template_utils";

const templates = get_templates();
async function extractor() {
  const csv_strings = {};
  await connect_db()
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

          const flattened_email_logs = _.map(collection, function (sub, ind) {
            return _.chain(
              _.reduce(
                sub._doc,
                function (result, email_log_field, key) {
                  if (key === "__v" || key === "_id") {
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
              )
            )
              .toPairs()
              .sort()
              .fromPairs()
              .value();
          });

          const column_names = _.keys(flattened_email_logs[0]);

          const time_corrected_email_logs = _.map(
            flattened_email_logs,
            function (sub) {
              return {
                ...sub,
                server_time: new Date(sub["server_time"]).toUTCString(),
              };
            }
          );

          if (time_corrected_email_logs.length > 0) {
            //check if there is actually any content to be writing

            const json2csv_parser = new Parser();

            const csv = json2csv_parser.parse(time_corrected_email_logs, {
              fields: column_names,
            });

            csv_strings[template_name] = csv;
          }
        }
      });
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      mongoose.connection.close();
      return csv_strings;
    });

  return csv_strings;
}

export async function get_csv_strings() {
  const csv_strings = await extractor();
  return { csv_strings };
}

export async function write_csvs() {
  const csv_strings = await extractor();

  const output_dir = `data_extracts/${new Date().toISOString()}`;
  fs.mkdirSync(output_dir, { recursive: true });

  _.forEach(csv_strings, (csv, template_name) => {
    const file_name = `${output_dir}/${template_name}.csv`;
    fs.writeFile(file_name, csv, function (err) {
      console.log(err || `Successfully saved ${file_name}.`);
    });
  });
}
