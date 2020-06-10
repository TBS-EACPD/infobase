import mongoose from "mongoose";
import _ from "lodash";

const meta_schema = mongoose.Schema({
  method: { type: String },
  requet_has_body: { type: Boolean },
  referer: { type: String },
});
const get_meta_fields_for_log = ({ method, body, headers: { referer } }) => ({
  method,
  requet_has_body: !_.isEmpty(body),
  referer,
});

const make_mongoose_model_from_original_template = _.memoize(
  ({ original_template, template_name }) => {
    const template_schema = _.chain(original_template)
      // todo, process original_template in to an appropriate schema
      .thru((template_schema_def) =>
        mongoose.Schema({
          //...template_schema_def,
          from: { type: String },
          to: { type: String },
          email_submission_meta: meta_schema,
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

const get_email_fields_for_log = (
  completed_template,
  original_template,
  email_config
) => {
  const { from, to } = email_config;
  //todo, logic likely to reflect the steps used to generate the template_schema above
};

export const log_email_and_meta_to_db = async (
  request,
  completed_template,
  template_name,
  original_template,
  email_config
) => {
  const model = make_mongoose_model_from_original_template({
    template_name,
    original_template,
  });

  const email_fields = get_email_fields_for_log(
    completed_template,
    original_template,
    email_config
  );
  const meta_sub_doc = get_meta_fields_for_log(request);

  debugger;

  return model.create({
    ...email_fields,
    email_submission_meta: meta_sub_doc,
  });
};
