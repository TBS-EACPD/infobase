import fetchMock from "fetch-mock";
import React, { useEffect } from "react";

import { form_backend_url } from "./form_backend_utils";

import { FormFrontend } from "./FormFrontend";

export default {
  title: "FormFrontend",
  component: FormFrontend,
};

const FormFrontendTemplate = ({
  return_error_on_get,
  return_error_on_post,
  example_template,
  props,
}) => {
  // small leak here, both form_backend_utils and here know about the specific form backend endpoints
  fetchMock.get(
    `${form_backend_url}/email_template?template_name=${props.template_name}`,
    () => {
      if (return_error_on_get) {
        throw new Error(
          "Some sort of error occured (client side OR server side)"
        );
      } else {
        return example_template;
      }
    },
    {
      overwriteRoutes: true,
    }
  );

  fetchMock.post(
    `${form_backend_url}/submit_email`,
    () => {
      if (return_error_on_post) {
        throw new Error(
          "Some sort of error occured (client side OR server side)"
        );
      } else {
        return { status: "200" };
      }
    },
    {
      overwriteRoutes: true,
    }
  );

  useEffect(() => {
    return () => fetchMock.reset();
  });

  return (
    <FormFrontend
      {...props}
      on_submitted={() => {
        console.log("Submitted");
      }}
      key={JSON.stringify(example_template)} // need to force component re-mount on template value changes for story controls to work
    />
  );
};

export const ExampleTemplate = FormFrontendTemplate.bind({});
ExampleTemplate.args = {
  return_error_on_get: false,
  return_error_on_post: false,
  example_template: {
    meta: {
      subject_template: "Example template",
    },
    checkbox_enum: {
      required: true,
      value_type: "enums",
      enum_values: {
        a: {
          en: "a",
          fr: "a (fr)",
        },
        b: {
          en: "b",
          fr: "b (fr)",
        },
        c: {
          en: "c",
          fr: "c (fr)",
        },
      },
      form_type: "checkbox",
      form_label: {
        en: "Checkbox enum example, required:",
        fr: "Checkbox enum example, required (fr):",
      },
    },
    radio_enum: {
      required: false,
      value_type: "enums",
      enum_values: {
        a: {
          en: "a",
          fr: "a (fr)",
        },
        b: {
          en: "b",
          fr: "b (fr)",
        },
        c: {
          en: "c",
          fr: "c (fr)",
        },
      },
      form_type: "radio",
      form_label: {
        en: "Radio enum example, optional:",
        fr: "Radio enum example, optional (fr):",
      },
    },

    text: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "Standalone text example, optional:",
        fr: "Standalone text example, optional (fr):",
      },
    },

    radio_enum_with_connected_text: {
      required: false,
      value_type: "enums",
      enum_values: {
        yes: {
          en: "Yes, requires below text",
          fr: "Yes, requires below text (fr)",
        },
        no: {
          en: "No, disables below text",
          fr: "No, disables below text (fr)",
        },
      },
      form_type: "radio",
      form_label: {
        en: "Radio with connected text example, optional:",
        fr: "Radio with connected text example, optional (fr):",
      },
    },
    connected_text: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "If yes, required text input. If no, disabled:",
        fr: "If yes, required text input. If no, disabled (fr):",
      },
      connection: {
        name: "radio_enum_with_connected_text",
        enable: "yes",
      },
    },

    optional_automatic: {
      required: false,
      value_type: "string",
      form_type: false,
    },
  },
  props: {
    include_privacy: true,
    template_name: "example_template",
  },
};
