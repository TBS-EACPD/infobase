import { Subject } from "../../models/subject.js";
const { Dept } = Subject;

export const sort_func_template = (a_name, b_name) => {
  if (a_name < b_name) {
    return -1;
  } else if (a_name > b_name) {
    return 1;
  }
  return 0;
};

export const default_dept_name_sort_func = (a, b) => {
  if (a && b) {
    const a_name = Dept.lookup(a).name.toUpperCase();
    const b_name = Dept.lookup(b).name.toUpperCase();
    return sort_func_template(a_name, b_name);
  }
  return 0;
};
