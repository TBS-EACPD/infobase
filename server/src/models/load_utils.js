import { readFileSync } from "fs";

import { join } from "path";

import { csvParse } from "d3-dsv";

import _ from "lodash";

const data_dir_path = `../data/${
  (process.env.USE_TEST_DATA && "test-data/") || ""
}`;

export function get_file_from_data_dir(file_name) {
  return readFileSync(join(data_dir_path, file_name)).toString("utf8").trim(); //auto trim to reduce csv head-aches
}

export const empties_to_nulls = (obj) =>
  _.mapValues(obj, (val) => (_.includes(["", "."], val) ? null : val));

export function get_standard_csv_file_rows(file_name) {
  const file = get_file_from_data_dir(file_name);

  // Not using _.snakeCase because we don't want it's behaviour of adding new _'s on case changes
  const file_with_snake_case_headers = _.replace(file, /^.+\n/, (header_row) =>
    _.chain(header_row).replace(" ", "_").toLower().value()
  );

  const rows = csvParse(file_with_snake_case_headers).map((row) =>
    empties_to_nulls(row)
  );

  return rows;
}

export const create_program_id = ({ dept_code, activity_code }) =>
  `${dept_code}-${activity_code}`;

export const bilingual_remap = (obj, dest_key, source_key) => ({
  [`${dest_key}_en`]: obj ? obj[`${source_key}_en`] : null,
  [`${dest_key}_fr`]: obj ? obj[`${source_key}_fr`] : null,
});
