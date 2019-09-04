import { declare_people_intro_panel } from "../../panels/intro_graphs/index.js";
import { declare_employee_last_year_totals_panel } from "../../panels/people/employee_last_year_totals.js";
import { declare_employee_totals_panel } from "../../panels/people/employee_totals.js";
import { declare_employee_prov_panel } from "../../panels/people/employee_prov.js";
import { declare_employee_type_panel } from "../../panels/people/employee_type.js";
import { declare_employee_age_panel } from "../../panels/people/employee_age.js";
import { declare_employee_executive_level_panel } from "../../panels/people/employee_executive_level.js";
import { declare_employee_fol_panel } from "../../panels/people/employee_fol.js";
import { declare_employee_gender_panel } from "../../panels/people/employee_gender.js";

export const get_people_panels = (subject) => [
  declare_people_intro_panel(),
  subject.level !== "gov" && declare_employee_last_year_totals_panel(),
  declare_employee_totals_panel(),
  declare_employee_prov_panel(),
  declare_employee_type_panel(),
  declare_employee_age_panel(),
  declare_employee_executive_level_panel(),
  declare_employee_fol_panel(),
  declare_employee_gender_panel(),
];