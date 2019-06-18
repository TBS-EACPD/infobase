import _ from "lodash";

const validate_completed_template = (original_template, completed_template) => {
  
  const {
    meta: original_meta,
    ...field_templates
  } = original_template;

  const {
    meta: completed_meta,
    ...completed_fields
  } = completed_template;

  const meta_unchanged = _.isEqual(original_meta, completed_meta);

  const required_fields_are_present = true; //todo

  const values_match_value_types = true; //todo

  const no_unexpected_fields = true; //todo

  return meta_unchanged;
};

export { validate_completed_template };