import { 
  validate_completed_template,
  verify_meta_unchanged,
  verify_required_fields_present,
  verify_values_are_expected_and_match_value_types,
} from './validate_completed_template.js'
import _ from 'lodash';

describe("Validation of completed templates", () => {

  it("verify_meta_unchanged checks deep equality of meta objects", () => {
    const meta_one = {
      subject_template: "bleh",
    };
    const meta_one_prime = {
      subject_template: "bleh",
    };
    const meta_two = {
      subject_template: "bleh",
      blah: "bluh",
    };
    const meta_three = {
      subject_template: "bluh",
    };

    return expect([
      verify_meta_unchanged(meta_one, meta_one_prime),
      verify_meta_unchanged(meta_one, meta_two),
      verify_meta_unchanged(meta_one, meta_three),
    ]).toEqual([
      true,
      false,
      false,
    ]);
  });

  const template_test_fields = {
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
    issue: {
      required: true,
      value_type: "string",
      form_type: "input",
      form_label: {
        en: "Issue description",
        fr: "Issue description",
      },
    },
    sha: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    id: {
      required: false,
      value_type: "string",
      form_type: false,
    },
    additional: {
      required: false,
      value_type: "json",
      form_type: false,
    },
  };
  const valid_completed_test_fields_complete = {
    enums: ["bug", "other"],
    issue: "I don't think the line graphs should always start at 0",
    sha: "fenef8723hhf2h9jdj2j3d92093",
    id: '1234qwert',
    additional: { bleh: "blah", bluh: { blagh: "blargh" } },
  };
  const valid_completed_test_fields_incomplete = {
    enums: ["bug", "other"],
    issue: "I don't think the line graphs should always start at 0",
    sha: "fenef8723hhf2h9jdj2j3d92093",
  };
  const invalid_completed_test_fields_missing_required = {
    issue: "I think the line graphs should always start at 0",
    id: '1234qwert',
    additional: { bleh: "blah", bluh: { blagh: "blargh" } },
  };
  const invalid_completed_test_fields_bad_value_type = {
    enums: "not a valid enum",
    issue: "I think the line graphs should always start at 0",
    sha: "fenef8723hhf2h9jdj2j3d92093",
    additional: "1",
  };
  const invalid_completed_test_fields_bad_extra_field = {
    enums: ["bug", "other"],
    issue: "I think the line graphs should always start at 0",
    sha: "fenef8723hhf2h9jdj2j3d92093",
    bonus: "Free real estate",
  };

  const test_completed_fields = [
    valid_completed_test_fields_complete,
    valid_completed_test_fields_incomplete,
    invalid_completed_test_fields_missing_required,
    invalid_completed_test_fields_bad_value_type,
    invalid_completed_test_fields_bad_extra_field,
  ];

  it("verify_required_fields_present checks that all fields marked required in the template are in the completed fields", () => {
    return expect(
      _.map(
        test_completed_fields,
        (completed_fields) => verify_required_fields_present(template_test_fields, completed_fields)
      )
    ).toEqual([
      true,
      true,
      false,
      true,
      true,
    ]);
  });

  it("values_are_expected_and_match_value_types checks that all present fields are expected and match their type from the original template", () => {
    return expect(
      _.map(
        test_completed_fields,
        (completed_fields) => verify_values_are_expected_and_match_value_types(template_test_fields, completed_fields)
      )
    ).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("validate_completed_template works end-to-end", () => {
    return expect(
      _.map(
        test_completed_fields,
        (completed_fields) => validate_completed_template(template_test_fields, completed_fields)
      )
    ).toEqual([
      true,
      true,
      false,
      false,
      false,
    ]);
  });

});