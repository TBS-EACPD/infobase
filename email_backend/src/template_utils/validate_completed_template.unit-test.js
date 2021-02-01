import _ from "lodash";

import {
  validate_completed_template,
  verify_required_fields_present,
  verify_values_are_expected_and_match_value_types,
} from "./validate_completed_template.js";

describe("validate_completed_template", () => {
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

  const valid_completed_test_fields = {
    enums: ["bug", "other"],
    radio: ["yes"],
    issue: "I don't think the line graphs should always start at 0",
    sha: "fenef8723hhf2h9jdj2j3d92093",
    id: "1234qwert",
    additional: { bleh: "blah", bluh: { blagh: "blargh" } },
  };
  const valid_completed_test_fields_required_only = _.omit(
    valid_completed_test_fields,
    ["id", "additional"]
  );
  const invalid_completed_test_fields_missing_required = _.omit(
    valid_completed_test_fields,
    ["issue"]
  );
  const invalid_completed_test_fields_bad_value_type = {
    ...valid_completed_test_fields,
    enums: "not a valid enum",
  };
  const invalid_completed_test_fields_bad_extra_field = {
    ...valid_completed_test_fields,
    bonus: "Free real estate",
  };
  const invalid_completed_test_fields_empty_required_enums = {
    ...valid_completed_test_fields,
    enums: [],
  };
  const invalid_completed_test_fields_multiple_values_from_a_radio_form = {
    ...valid_completed_test_fields,
    radio: ["yes", "no"],
  };

  const test_completed_fields = [
    valid_completed_test_fields,
    valid_completed_test_fields_required_only,
    invalid_completed_test_fields_missing_required,
    invalid_completed_test_fields_bad_value_type,
    invalid_completed_test_fields_bad_extra_field,
    invalid_completed_test_fields_empty_required_enums,
    invalid_completed_test_fields_multiple_values_from_a_radio_form,
  ];

  it("verify_required_fields_present checks that all fields marked required in the template are in the completed fields", () => {
    return expect(
      _.map(test_completed_fields, (completed_fields) =>
        verify_required_fields_present(template_test_fields, completed_fields)
      )
    ).toEqual([true, true, false, true, true, true, true]);
  });

  it("values_are_expected_and_match_value_types checks that all present fields are expected and match their type from the original template", () => {
    return expect(
      _.map(test_completed_fields, (completed_fields) =>
        verify_values_are_expected_and_match_value_types(
          template_test_fields,
          completed_fields
        )
      )
    ).toEqual([true, true, true, false, false, false, false]);
  });

  it("validate_completed_template works end-to-end", () => {
    return expect(
      _.map(test_completed_fields, (completed_fields) =>
        validate_completed_template(template_test_fields, completed_fields)
      )
    ).toEqual([true, true, false, false, false, false, false]);
  });
});
