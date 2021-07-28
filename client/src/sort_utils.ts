import _ from "lodash";

const get_plain_string = (string: string) =>
  _.chain(string).deburr().lowerCase().value();
export const string_sort_func = (a: string, b: string) => {
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

export const number_sort_func = (a: number, b: number) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
};

const wrap_sort_with_direction = <T>(
  reverse: boolean,
  sort_func: (a: T, b: T) => 1 | 0 | -1
) =>
  !reverse ? (a: T, b: T) => sort_func(a, b) : (a: T, b: T) => sort_func(b, a);

export const smart_sort_func = (
  a: number | string,
  b: number | string,
  reverse = false
) => {
  if (typeof a === "string" && typeof b === "string") {
    return wrap_sort_with_direction<string>(reverse, string_sort_func)(a, b);
  } else if (typeof a === "number" && typeof b === "number") {
    return wrap_sort_with_direction<number>(reverse, number_sort_func)(a, b);
  } else {
    throw new Error(
      `smart_sort_func is not valid for combination of type ${typeof a} and ${typeof b}`
    );
  }
};
