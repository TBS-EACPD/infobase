jest.mock("mongoose"); // eslint-disable-line no-undef
import mongoose from "mongoose";
const actual_mongoose = jest.requireActual("mongoose"); // eslint-disable-line no-undef
mongoose.Schema.mockImplementation(actual_mongoose.Schema);
mongoose.model.mockImplementation((name, schema) => {
  const model = actual_mongoose.model(name, schema);

  model.create = async (record_obj) => {
    let validated = true;
    try {
      await model.validate(record_obj);
    } catch (err) {
      validated = err;
    }
    return validated;
  };

  return model;
});

import { log_email_and_meta_to_db } from "./log_email_and_meta_to_db.js";

describe("log_email_and_meta_to_db", () => {
  const request = { method: "POST", headers: { referer: "http://localhost" } };
  const template_name = "test_template";
  const original_template = {
    meta: {
      subject_template: "Test subject: [${enums}], ${radio}, ${number}",
    },

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
    text: {
      required: true,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "Text",
        fr: "Text",
      },
    },
    number: {
      required: true,
      value_type: "number",
      form_type: "test",
      form_label: {
        en: "Number",
        fr: "Number",
      },
    },
    json: {
      required: true,
      value_type: "json",
      form_type: "textarea",
      form_label: {
        en: "JSON",
        fr: "JSON",
      },
    },

    required_automatic: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    optional_automatic: {
      required: false,
      value_type: "string",
      form_type: false,
    },
  };
  const completed_template = {
    enums: ["bug", "other"],
    radio: ["yes"],
    text: "a",
    number: 1,
    json: { bleh: "bleh", a: 1 },

    required_automatic: "blah",
    optional_automatic: "bluh",
  };
  const email_config = {
    to: "bleh@blah.ca",
    from: "blah@bleh.com",
  };

  it("Builds a mongoose model from the original template, constructs and saves a valid record based on the completed template", async () => {
    // The model.create call at the end of log_email_and_meta_to_db has been mocked out and replaced with model.validate
    const final_record_object_validated_against_constructed_model =
      await log_email_and_meta_to_db(
        request,
        template_name,
        original_template,
        completed_template,
        email_config
      );

    return expect(
      final_record_object_validated_against_constructed_model
    ).toEqual(true);
  });
});
