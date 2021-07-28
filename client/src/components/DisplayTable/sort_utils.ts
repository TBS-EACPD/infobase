import _ from "lodash";

const get_plain_string = (string: string) =>
  _.chain(string).deburr().lowerCase().value();
const string_sort_func = (a: string, b: string) => {
  const plain_a = get_plain_string(a);
  const plain_b = get_plain_string(b);

  // Note order reversed from the native JS string comparison; we want A to be big not small
  if (plain_a < plain_b) {
    return 1;
  } else if (plain_a > plain_b) {
    return -1;
  }
  return 0;
};

const number_sort_func = (a: number, b: number) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
};

const sort_with_direction = <T>(
  descending: boolean,
  sort_func: (a: T, b: T) => 1 | 0 | -1
) =>
  !descending
    ? (a: T, b: T) => sort_func(a, b)
    : (a: T, b: T) => sort_func(b, a);

export const default_sort_func = (
  a: number | string,
  b: number | string,
  descending: boolean
) => {
  if (typeof a === "string" && typeof b === "string") {
    return sort_with_direction<string>(descending, string_sort_func)(a, b);
  } else if (typeof a === "number" && typeof b === "number") {
    return sort_with_direction<number>(descending, number_sort_func)(a, b);
  } else {
    throw new Error(
      `default_sort_func is not valid for combination of type ${typeof a} and ${typeof b}`
    );
  }
};
