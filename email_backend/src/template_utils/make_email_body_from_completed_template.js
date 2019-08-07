import _ from 'lodash';

const indent_new_lines = (string, indenting_spaces=4) => _.replace(
  string,
  /\n[^\n]/g,
  (match) => _.replace(
    match,
    /^\n/, 
    "\n" + " ".repeat(indenting_spaces)
  )
);

const make_email_body_from_completed_template = (original_template, completed_template) => {
  const field_templates = _.omit(original_template, "meta");
  const completed_fields = _.omit(completed_template, "meta");

  return _.chain(completed_fields)
    .map(
      (field_value, field_key) => {
        const template = field_templates[field_key];
        const {value_type} = template;

        const value = (
          () => {
            switch (value_type){
              case "json":
                return JSON.stringify(field_value, null, 2);
              case "enums":
                return _.join(field_value, ', ');
              default:
                return field_value;
            }
          }
        )();

        return `${field_key}:\n    ${indent_new_lines(value)}`;
      }
    )
    .join("\n\n")
    .value();
};

export { make_email_body_from_completed_template };