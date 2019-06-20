import { make_email_body_from_completed_template } from './make_email_body_from_completed_template.js';

describe("Completion of template email body from completed template", () => {

  it("make_email_body_from_completed_template properly generates body content", () => {
    const original_test_template = {};
    const completed_test_template = {};

    const expected_body_content = "TODO";

    return expect(
      make_email_body_from_completed_template(
        original_test_template,
        completed_test_template,
      )
    ).toEqual(
      expected_body_content
    );
  });

});