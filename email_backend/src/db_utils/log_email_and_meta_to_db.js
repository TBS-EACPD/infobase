import _ from "lodash";
import mongoose from "mongoose";

const required_string = { type: String, required: true };
const meta_schema_def = {
  to: required_string,
  from: required_string,
  referer: required_string,
  server_time: { type: Date, required: true },
  date: required_string,
  time: required_string,
};
const get_meta_fields_for_log = (email_config, request) => {
  const { to, from } = email_config;
  const {
    headers: { referer },
  } = request;

  const server_time = new Date();

  return {
    to,
    from,
    referer,
    server_time,
    date: server_time.toLocaleDateString("en-CA"),
    time: server_time.toLocaleTimeString("en-CA"),
  };
};

const template_type_to_schema_type = (value_type) => {
  switch (value_type) {
    case "enums":
      return [String];
    case "json":
      return Object;
    case "number":
      return Number;
    default:
      return String;
  }
};
export const make_mongoose_model_from_original_template = _.memoize(
  ({ original_template, template_name }) => {
    const template_schema = _.chain(original_template)
      .mapValues(({ required, value_type }) => ({
        required,
        type: template_type_to_schema_type(value_type),
      }))
      .thru((template_schema_def) =>
        mongoose.Schema({
          ...template_schema_def,
          email_meta: meta_schema_def,
        })
      )
      .value();

    const model_name = `${template_name}_emails`;

    // Creating a mongoose model has the side effect of initializing a corresponding collection on the
    // connected DB. This operation will buffer if the DB is not yet connected
    return mongoose.model(model_name, template_schema);
  },
  ({ template_name }) => template_name
);

export const log_email_and_meta_to_db = async (
  request,
  template_name,
  original_template,
  completed_template,
  email_config
) => {
  const model = make_mongoose_model_from_original_template({
    template_name,
    original_template,
  });

  const meta_sub_doc = get_meta_fields_for_log(email_config, request);

  return model.create({
    ...completed_template,
    email_meta: meta_sub_doc,
  });
};
