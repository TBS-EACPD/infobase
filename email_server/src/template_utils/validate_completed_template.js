import _ from "lodash";

// TODO: would be more useful if this threw descriptive errors

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

  const values_are_expected_and_match_value_types = verify_values_are_expected_and_match_value_types(field_templates, completed_fields);

  return meta_unchanged && required_fields_present && values_are_expected_and_match_value_types;
};

const verify_meta_unchanged = (original_meta, completed_meta) => _.isEqual(original_meta, completed_meta);

const verify_required_fields_present = (field_templates, completed_fields) => _.chain(field_templates)
  .pickBy( _.property("required") )
  .keys()
  .map( (required_key) => completed_fields[required_key] )
  .every()
  .value();

const verify_values_are_expected_and_match_value_types = (field_templates, completed_fields) => _.chain(completed_fields)
  .map(
    (field_value, field_key) => {
      const expected_type = _.get(field_templates, `${field_key}.value_type`);

      if (expected_type){
        switch (expected_type){
          case "string":
            return _.isString(field_value);
          case "number":
            return _.isNumber(field_value);
          case "json":
            return _.isObject(field_value);
          case "enums":
            return _.every(
              field_value,
              (enum_key) => _.chain(field_templates)
                .get(`${field_key}.enum_values`)
                .has(enum_key)
                .value()
            );
          default:
            return false; //unexpected type in the json itself
        }
      } else {
        return false; //unexpected field in completed_fields
      }
    }
  )
  .every()
  .value();


export { 
  validate_completed_template,
  verify_meta_unchanged,
  verify_required_fields_present,
  verify_values_are_expected_and_match_value_types,
};