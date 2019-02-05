// Used for model class names 
const camel_case_headcount_model_names = [
  "EmployeeType",
  "EmployeeRegion",
  "EmployeeAgeGroup",
  "EmployeeExLvl",
  "EmployeeGender",
  "EmployeeFol",
];

const camel_case_to_snake_case = (camel_case_string) => camel_case_string.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();

// Used in headcount model schema and for headcount csv's
// 1-to-1 with headcount model names
const snake_case_headcount_model_names = camel_case_headcount_model_names.map( 
  camel_case_name => camel_case_to_snake_case(camel_case_name)
);

export {
  camel_case_to_snake_case,
  camel_case_headcount_model_names,
  snake_case_headcount_model_names,
}