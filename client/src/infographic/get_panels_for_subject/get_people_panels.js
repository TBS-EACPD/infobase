import "../../panels/people/employee_last_year_totals.js";
import "../../panels/people/employee_totals.js";
import "../../panels/people/employee_type.js";
import "../../panels/people/employee_prov.js";
import "../../panels/people/employee_age.js";
import "../../panels/people/employee_executive_level.js";
import "../../panels/people/employee_gender.js";
import "../../panels/people/employee_fol.js";

export const get_people_panels = (subject) => [
  'people_intro',
  subject.level !== "gov" && "employee_last_year_totals",
  "employee_totals",
  "employee_prov",
  "employee_type",
  "employee_age",
  "employee_executive_level",
  "employee_fol",
  "employee_gender",
];