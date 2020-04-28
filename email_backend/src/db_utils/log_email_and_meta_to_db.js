import mongoose from "mongoose";

const meta_schema = mongoose.Schema({
  // todo, what meta do we want to log? Stuff from request object and email_config (sending user agent, recipient address, etc)
});

const make_mongoose_model_from_original_template = _.memoize(
  ({original_template, template_name}) => {
    const template_schema = _.chain(original_template)
      // todo, process original_template in to an appropriate schema
      .thru(
        (template_schema_def) => mongoose.Schema({
          ...template_schema_def,
          email_submission_meta: meta_schema,
        })
      )
      .value()

    const model_name = `${template_name}_emails`;

    return mongoose.model(model_name, template_schema);
  },
  ({template_name}) => template_name,
);


const get_email_fields_for_log = (completed_template, original_template) => {
  //todo, logic likely to reflect the steps used to generate the template_schema above
};

const get_meta_fields_for_log = (request, email_config) => {
  // todo, need to settle on contents of meta_schema first
};


export const log_email_and_meta_to_db = (
  request,
  completed_template,
  template_name,
  original_template,
  email_config
) => {
  const model = make_mongoose_model_from_original_template({template_name, original_template});

  const email_fields = get_email_fields_for_log(completed_template, original_template);
  const meta_fields = get_meta_fields_for_log(request, email_config);

  // short hand for adding a new entry to the collection with model_name (see make_mongoose_model_from_original_template),
  // creates a new collection with that name if one doesn't yet exist in the connected DB
  model.create({
    ...email_fields,
    ...meta_fields,
  });
};