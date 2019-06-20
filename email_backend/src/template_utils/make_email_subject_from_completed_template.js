import _ from 'lodash';

const make_email_subject_from_completed_template = (original_template, completed_template) => {
  const { subject_template } = original_template.meta;
  
  const template_keys = _.chain(subject_template)
    .words(/\${.+?}/g)
    .map( (template_fragment) => template_fragment.replace(/[${}]/g, '') )
    .value();

  const template_map = _.chain(template_keys)
    .map(
      (template_key) => [
        template_key, 
        _.get(completed_template, template_key) || `no ${template_key}`,
      ]
    )
    .fromPairs()
    .value();
 
  return _.template(subject_template)(template_map);
};

export { make_email_subject_from_completed_template };