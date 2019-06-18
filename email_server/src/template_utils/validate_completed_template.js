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

  const meta_unchanged = verify_meta_unchanged(original_meta, completed_meta);

  const required_fields_present = verify_required_fields_present(field_templates, completed_fields);

  const values_match_value_types = verify_values_match_value_types(field_templates, completed_fields);

  const no_unexpected_fields = verify_no_unexpected_fields(field_templates, completed_fields);

  return meta_unchanged && required_fields_present && values_match_value_types && no_unexpected_fields;
};

const verify_meta_unchanged = (original_meta, completed_meta) => _.isEqual(original_meta, completed_meta);

const verify_required_fields_present = (field_templates, completed_fields) => _.chain(field_templates)
  .pickBy( _.property("required") )
  .keys()
  .map( (required_key) => completed_fields[required_key] )
  .every()
  .value();

const verify_values_match_value_types = (field_templates, completed_fields) => {
  return false; //todo
};

const verify_no_unexpected_fields = (field_templates, completed_fields) => {
  return false; //todo
};

export { 
  validate_completed_template,
  verify_meta_unchanged,
  verify_required_fields_present,
  verify_values_match_value_types,
  verify_no_unexpected_fields,
};