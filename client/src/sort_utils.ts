import _ from "lodash";

type SortComparator = 1 | 0 | -1;

type EmptyValue = undefined | null;
const is_empty = <T>(value: T | EmptyValue): value is EmptyValue =>
  typeof value === "undefined" || value === null;

export const wrap_sort_with_empty_handling = <T>(
  a: T | EmptyValue,
  b: T | EmptyValue,
  sort_func: (a: T, b: T) => SortComparator
): SortComparator => {
  if (!is_empty(a) && !is_empty(b)) {
    return sort_func(a, b);
  }

  if (is_empty(a) && !is_empty(b)) {
    return -1;
  } else if (!is_empty(a) && is_empty(b)) {
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
  a: string | EmptyValue,
  b: string | EmptyValue
) =>
  wrap_sort_with_empty_handling(
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
  a: number | EmptyValue,
  b: number | EmptyValue
) =>
  wrap_sort_with_empty_handling(
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

export const smart_sort_func = <T extends string | number | EmptyValue>(
  a: T,
  b: T,
  reverse = false
): SortComparator => {
  if (
    (typeof a === "string" || is_empty(a)) &&
    (typeof b === "string" || is_empty(b))
  ) {
    return wrap_sort_with_direction(reverse, string_sort_func)(a, b);
  } else if (
    (typeof a === "number" || is_empty(a)) &&
    (typeof b === "number" || is_empty(b))
  ) {
    return wrap_sort_with_direction(reverse, number_sort_func)(a, b);
  } else {
    throw new Error(
      `smart_sort_func is not valid for combination of type ${typeof a} and ${typeof b}`
    );
  }
};
