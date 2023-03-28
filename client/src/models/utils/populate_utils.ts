import { csvParse } from "d3-dsv";
import _ from "lodash";

export const enforced_required_fields = <
  RequiredFields extends Record<string, string | undefined>
>(
  enforced_required_fields: RequiredFields
) => {
  _.forEach(enforced_required_fields, (cell, key) => {
    if (typeof cell === "undefined") {
      throw new Error(`Required field "${key}" has an empty cell`);
    }
  });

  return enforced_required_fields as unknown as {
    [key in keyof RequiredFields]: string;
  };
};

export const parse_csv_string_with_undefined_blanks = (
  csv_string: string
): { [x: string]: string | undefined }[] =>
  csvParse(csv_string, (row) =>
    _.mapValues(row, (value) => (value === "" ? undefined : value))
  );

export type ParsedCsvWithUndefineds = ReturnType<
  typeof parse_csv_string_with_undefined_blanks
>;
