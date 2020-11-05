import { get_templates } from "./get_templates.js";
import { make_email_body_from_completed_template } from "./make_email_body_from_completed_template.js";
import { make_email_subject_from_completed_template } from "./make_email_subject_from_completed_template.js";
import { validate_completed_template } from "./validate_completed_template.js";

export {
  get_templates,
  validate_completed_template,
  make_email_subject_from_completed_template,
  make_email_body_from_completed_template,
};
