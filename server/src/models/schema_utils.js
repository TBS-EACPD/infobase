export const en_fr = (en_attr, fr_attr) => (obj, _args, context) =>
  context.lang === "en" ? obj[en_attr] : obj[fr_attr];

export const bilingual_field = (base_field_name) => (obj, _args, context) =>
  obj[`${base_field_name}_${context.lang}`];
