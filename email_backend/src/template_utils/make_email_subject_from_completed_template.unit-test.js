import { make_email_subject_from_completed_template } from './make_email_subject_from_completed_template.js';

describe("make_email_subject_from_completed_template", () => {

  it("properly generates subject messages", () => {
    const original_test_template = {
      meta: {
        subject_template: "Test subject: [${enums}], ${number}, ${blah}",
      },
    };
    const completed_test_template = {
      enums: ["bleh", "blah"],
      number: 1,
      text: "a",
    };

    const expected_subject_line = "Test subject: [bleh,blah], 1, no blah";

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