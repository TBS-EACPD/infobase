import { make_email_body_from_completed_template } from "./make_email_body_from_completed_template.js";

describe("make_email_body_from_completed_template", () => {
  it("properly generates body content", () => {
    const original_test_template = {
      enums: {
        required: true,
        value_type: "enums",
        enum_values: {
          bug: {
            en: "Something is broken",
            fr: "Quelque chose ne fonctionne pas",
          },
          typo: {
            en: "It has a spelling or grammar mistake",
            fr: "II y a une erreur d'orthographe ou de grammaire",
          },
          other: {
            en: "Other",
            fr: "Autre",
          },
        },
        form_type: "checkbox",
        form_label: {
          en: "Select all that apply:",
          fr: "Sélectionner toutes les cases qui s'appliquent :",
        },
      },
      radio: {
        required: true,
        value_type: "enums",
        enum_values: {
          yes: {
            en: "Yes",
            fr: "Oui",
          },
          no: {
            en: "No",
            fr: "Non",
          },
        },
        form_type: "radio",
        form_label: {
          en: "Did you find what you were looking for on GC InfoBase?",
          fr: "Avez-vous trouvé ce que vous cherchiez dans InfoBase du GC?",
        },
      },
      issue: {
        required: true,
        value_type: "string",
        form_type: "input",
        form_label: {
          en: "Issue description",
          fr: "Issue description",
        },
      },
      json: {
        required: true,
        value_type: "json",
        form_type: false,
      },
      some_number: {
        required: true,
        value_type: "number",
        form_type: false,
      },
    };
    const completed_test_template = {
      enums: ["bug", "typo"],
      radio: ["yes"],
      issue:
        "Lorem ipsum dolor sit amet, varius nulla justo sed, tincidunt interdum lectus, diam donec rhoncus wisi ut. Lacinia massa risus mi risus phasellus id. Sollicitudin convallis vel eget libero, porttitor aenean elementum, ornare at, nullam quis, pellentesque erat id. Rhoncus pretium nec luctus mauris tincidunt, donec adipiscing vivamus tempus, mauris nullam porttitor natoque elit, lectus sapien libero vestibulum venenatis quisque. Eros tempor in, ipsum luctus sit suspendisse tincidunt, wisi id mollis viverra. Orci diam pede nunc, non nec condimentum dui aliquam aliquet tortor, libero ut cras. Vel blandit eu wisi rhoncus, sit dicta, a sem in sed, ipsum iaculis.",
      json: { bleh: "blah", bluh: { blagh: "blargh" } },
      some_number: 1,
    };

    const expected_body_content = `enums:\n    bug, typo\n
radio:\n    yes\n
issue:\n    ${completed_test_template.issue}\n
json:\n    {\n      "bleh": "blah",\n      "bluh": {\n        "blagh": "blargh"\n      }\n    }\n
some_number:\n    1`;

    return expect(
      make_email_body_from_completed_template(
        original_test_template,
        completed_test_template
      )
    ).toEqual(expected_body_content);
  });
});
