const make_email_body_from_completed_template = (original_template, completed_template) => {
  const field_templates = _.omit(original_template, "meta");
  const completed_fields = _.ommit(completed_template, "meta");

  return JSON.stringify(completed_template); // temporary
};

export { make_email_body_from_completed_template };