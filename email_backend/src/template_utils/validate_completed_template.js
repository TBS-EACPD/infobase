import _ from "lodash";

const verify_required_fields_present = (field_templates, completed_fields) =>
  _.chain(field_templates)
    .pickBy(_.property("required"))
    .keys()
    .map((required_key) => completed_fields[required_key])
    .every()
    .value();

const verify_values_are_expected_and_match_value_types = (
  field_templates,
  completed_fields
) =>
  _.chain(completed_fields)
    .map((submitted_value, field_key) => {
      const expected_type = _.get(field_templates, `${field_key}.value_type`);
      const is_required = _.get(field_templates, `${field_key}.required`);

      if (expected_type) {
        switch (expected_type) {
          case "string":
            return _.isString(submitted_value);
          case "number":
            return _.isNumber(submitted_value);
          case "json":
            return _.isObject(submitted_value);
          case "enums":
            return _.chain(field_templates)
              .get(`${field_key}.enum_values`)
              .keys()
              .thru((enum_values) => {
                const some_submitted_values_are_not_enum_options =
                  _.without(submitted_value, ...enum_values).length > 0;
                const required_field_but_no_valid_values =
                  is_required &&
                  _.intersection(submitted_value, enum_values).length === 0;
                const radio_form_but_multiple_values =
                  field_templates[field_key].form_type === "radio" &&
                  submitted_value.length > 1;

                return (
                  !some_submitted_values_are_not_enum_options &&
                  !required_field_but_no_valid_values &&
                  !radio_form_but_multiple_values
                );
              })
              .value();
          default:
            return false; //unexpected type in the json itself
        }
      } else {
        return false; //unexpected field in completed_fields
      }
    })
    .every()
    .value();

const validate_completed_template = (original_template, completed_template) => {
  const field_templates = _.omit(original_template, "meta");
  const completed_fields = _.omit(completed_template, "meta");

  const required_fields_present = verify_required_fields_present(
    field_templates,
    completed_fields
  );

  const values_are_expected_and_match_value_types =
    verify_values_are_expected_and_match_value_types(
      field_templates,
      completed_fields
    );

  return required_fields_present && values_are_expected_and_match_value_types;
};

export {
  validate_completed_template,
  verify_required_fields_present,
  verify_values_are_expected_and_match_value_types,
};
