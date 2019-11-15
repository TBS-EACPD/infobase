import {
  declare_people_key_concepts_panel,
  declare_employee_last_year_totals_panel,
  declare_employee_totals_panel,
  declare_employee_prov_panel,
  declare_employee_type_panel,
  declare_employee_age_panel,
  declare_employee_executive_level_panel, 
  declare_employee_fol_panel,
  declare_employee_gender_panel,
} from "../panel_declarations/index.js";

export const get_people_panels = (subject) => [
  declare_people_key_concepts_panel(),
  subject.level !== "gov" && declare_employee_last_year_totals_panel(),
  declare_employee_totals_panel(),
  declare_employee_prov_panel(),
  declare_employee_type_panel(),
  declare_employee_age_panel(),
  declare_employee_executive_level_panel(),
  declare_employee_fol_panel(),
  declare_employee_gender_panel(),
];