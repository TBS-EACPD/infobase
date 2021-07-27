import _ from "lodash";

import { Subject } from "src/models/subject";
const { Dept } = Subject;

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

interface subject_class {
  lookup: (id: number | string) => { name: string };
}

export const default_subject_name_sort_func = (
  subject_class: subject_class,
  subject_id_a: number | string,
  subject_id_b: number | string,
  descending: boolean
) => {
  if (subject_class && subject_id_a && subject_id_b) {
    const a_name = subject_class.lookup(subject_id_a).name.toUpperCase();
    const b_name = subject_class.lookup(subject_id_b).name.toUpperCase();
    return default_sort_func(a_name, b_name, descending);
  }
  return 0;
};

export const default_dept_name_sort_func = (
  dept_id_a: number | string,
  dept_id_b: number | string,
  descending: boolean
) => default_subject_name_sort_func(Dept, dept_id_a, dept_id_b, descending);
