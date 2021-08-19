import _ from "lodash";

type SortComparator = 1 | 0 | -1;

export const wrap_sort_with_undefined_handling = <T>(
  a: T | undefined,
  b: T | undefined,
  sort_func: (a: T, b: T) => SortComparator
): SortComparator => {
  if (typeof a !== "undefined" && typeof b !== "undefined") {
    return sort_func(a, b);
  }

  if (typeof a === "undefined" && typeof b !== "undefined") {
    return -1;
  } else if (typeof a !== "undefined" && typeof b === "undefined") {
    return 1;
  }
  return 0;
};

export const wrap_sort_with_direction = <T>(
  reverse: boolean,
  sort_func: (a: T, b: T) => SortComparator
) =>
  !reverse ? (a: T, b: T) => sort_func(a, b) : (a: T, b: T) => sort_func(b, a);

const get_plain_string = (string: string) =>
  _.chain(string).deburr().lowerCase().value();
export const string_sort_func = (
  a: string | undefined,
  b: string | undefined
) =>
  wrap_sort_with_undefined_handling(
    a,
    b,
    (a: string, b: string): SortComparator => {
      const plain_a = get_plain_string(a);
      const plain_b = get_plain_string(b);

      // Note order reversed from the native JS string comparison; we want A to be big not small
      if (plain_a < plain_b) {
        return 1;
      } else if (plain_a > plain_b) {
        return -1;
      }
      return 0;
    }
  );

export const number_sort_func = (
  a: number | undefined,
  b: number | undefined
) =>
  wrap_sort_with_undefined_handling(
    a,
    b,
    (a: number, b: number): SortComparator => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    }
  );

export const smart_sort_func = <T extends number | string | undefined>(
  a: T,
  b: T,
  reverse = false
): SortComparator => {
  if (
    (typeof a === "string" || typeof a === "undefined") &&
    (typeof b === "string" || typeof b === "undefined")
  ) {
    return wrap_sort_with_direction(reverse, string_sort_func)(a, b);
  } else if (
    (typeof a === "number" || typeof a === "undefined") &&
    (typeof b === "number" || typeof b === "undefined")
  ) {
    return wrap_sort_with_direction(reverse, number_sort_func)(a, b);
  } else {
    throw new Error(
      `smart_sort_func is not valid for combination of type ${typeof a} and ${typeof b}`
    );
  }
};
