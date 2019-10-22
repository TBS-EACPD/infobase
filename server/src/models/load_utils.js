const _ = require('lodash');
const fs = require('fs');
const { csvParseRows, csvParse } = require('d3-dsv');
const path = require('path');

const data_dir_path = `../data/${( global.USE_TEST_DATA || !_.isUndefined(process.env.USE_TEST_DATA) ) && "test-data/" || ""}`;

function get_file_from_data_dir(file_name){
  return fs.readFileSync( path.join(data_dir_path, file_name) )
    .toString("utf8")
    .trim(); //auto trim to reduce csv head-aches
}

export const empties_to_nulls = (obj) => _.mapValues(
  obj, 
  val => _.includes(["","."], val) ? null : val
);

function get_standard_csv_file_rows(file_name){
  const file = get_file_from_data_dir(file_name);

  // Not using _.snakeCase because we don't want it's behaviour of adding new _'s on case changes
  const file_with_snake_case_headers = _.replace(
    file,
    /^.+\n/,
    (header_row) => _.chain(header_row)
      .replace(" ", "_")
      .toLower()
      .value()
  );

  const rows = csvParse(file_with_snake_case_headers)
    .map( row => empties_to_nulls(row) );

  return rows;
}

const create_program_id = ({ dept_code, activity_code }) => `${dept_code}-${activity_code}`;

const bilingual_remap = (obj, dest_key, source_key) => ({
  [`${dest_key}_en`]: obj ? obj[`${source_key}_en`] : null,
  [`${dest_key}_fr`]: obj ? obj[`${source_key}_fr`] : null,
});

// Populate time validation will choke on either the string representation of a negative number or a value of NaN
// Need to parse strings to numbers ourselves to handle negatives, but take care to preserve nulls which we assume are csv blanks (trying to convert a null gives a NaN)
// Preserving nulls instead of defaulting to nulls because we still want validation errors to surface when any other data issue produces a NaN!
const null_preserving_to_number = (value) => _.isNaN( _.toNumber(value) ) ? null : _.toNumber(value);

module.exports = exports = {
  get_file_from_data_dir,
  empties_to_nulls,
  csvParse,
  csvParseRows,

  get_standard_csv_file_rows,

  create_program_id,
  bilingual_remap,
  null_preserving_to_number,
};
