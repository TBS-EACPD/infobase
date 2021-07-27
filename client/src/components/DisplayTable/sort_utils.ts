import { Subject } from "src/models/subject";
const { Dept } = Subject;

export const sort_func_template = (a: number | string, b: number | string) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
};

interface subject_class {
  lookup: (id: number | string) => { name: string };
}

export const default_subject_name_sort_func = (
  subject_class: subject_class,
  subject_id_a: number | string,
  subject_id_b: number | string
) => {
  if (subject_class && subject_id_a && subject_id_b) {
    const a_name = subject_class.lookup(subject_id_a).name.toUpperCase();
    const b_name = subject_class.lookup(subject_id_b).name.toUpperCase();
    return sort_func_template(a_name, b_name);
  }
  return 0;
};

export const default_dept_name_sort_func = (
  dept_id_a: number | string,
  dept_id_b: number | string
) => default_subject_name_sort_func(Dept, dept_id_a, dept_id_b);
