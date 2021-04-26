const fs = require("fs");

const path = require("path");

const { csvParseRows, csvParse } = require("d3-dsv");
const _ = require("lodash");

const data_dir_path = `../data/${
  (process.env.USE_TEST_DATA && "test-data/") || ""
}`;

function get_file_from_data_dir(file_name) {
  return fs
    .readFileSync(path.join(data_dir_path, file_name))
    .toString("utf8")
    .trim(); //auto trim to reduce csv head-aches
}

export const empties_to_nulls = (obj) =>
  _.mapValues(obj, (val) => (_.includes(["", "."], val) ? null : val));

function get_standard_csv_file_rows(file_name) {
  const file = get_file_from_data_dir(file_name);

  // Not using _.snakeCase because we don't want it's behaviour of adding new _'s on case changes
  const file_with_snake_case_headers = _.replace(file, /^.+\n/, (header_row) =>
    _(header_row)
      .thru((header_row) => _.replace(header_row, " ", "_"))
      .toLower()
  );

  const rows = csvParse(file_with_snake_case_headers).map((row) =>
    empties_to_nulls(row)
  );

  return rows;
}

const create_program_id = ({ dept_code, activity_code }) =>
  `${dept_code}-${activity_code}`;

const bilingual_remap = (obj, dest_key, source_key) => ({
  [`${dest_key}_en`]: obj ? obj[`${source_key}_en`] : null,
  [`${dest_key}_fr`]: obj ? obj[`${source_key}_fr`] : null,
});

module.exports = exports = {
  get_file_from_data_dir,
  empties_to_nulls,
  csvParse,
  csvParseRows,

  get_standard_csv_file_rows,

  create_program_id,
  bilingual_remap,
};
