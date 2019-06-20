import { make_email_subject_from_completed_template } from './make_email_subject_from_completed_template.js';

describe("Completion of template email subject from completed template", () => {

  it("make_email_subject_from_completed_template properly generates subject messages", () => {
    const original_test_template = {};
    const completed_test_template = {};

    const expected_subject_line = "TODO";

    return expect(
      make_email_subject_from_completed_template(
        original_test_template,
        completed_test_template,
      )
    ).toEqual(
      expected_subject_line
    );
  });

});