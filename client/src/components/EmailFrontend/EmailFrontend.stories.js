import fetchMock from "fetch-mock";
import React, { useState } from "react";

import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";

import { EmailFrontend } from "./EmailFrontend";

export default {
  title: "EmailFrontend",
  component: EmailFrontend,
  argTypes: {
    loading: {
      defaultValue: true,
    },
    include_privacy: {
      defaultValue: true,
    },
    all_required_user_fields_are_filled: {
      defaultValue: true,
    },
  },
};

const Template = (args) => {
  const [template, setTemplate] = useState(args.template);
  fetchMock.getOnce("*", template, { overwriteRoutes: true });
  fetchMock.postOnce("*", {}, { overwriteRoutes: true });
  const on_submitted = () => {
    console.log("Submitted");
  };
  if (!args.loading) {
    return (
      <div>
        <EmailFrontend {...args} on_submitted={on_submitted} />
      </div>
    );
  } else {
    return (
      <div>
        <LeafSpinner />
      </div>
    );
  }
};

export const Report_a_Problem = Template.bind({});
Report_a_Problem.args = {
  template: {
    meta: {
      subject_template:
        "Report a problem: [${issue_type}], ${lang}, ${route}, ${sha}, ${client_id}",
    },
    issue_type: {
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
        inaccurate: {
          en: "The information is wrong",
          fr: "L'information est erronée",
        },
        outdated: {
          en: "The information is outdated",
          fr: "L'information n'est plus à jour",
        },
        navigation: {
          en: "I can't find what I'm looking for",
          fr: "Je ne trouve pas ce que je cherche",
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
    issue_details: {
      required: true,
      value_type: "string",
      form_type: "textarea",
      form_label: { en: "Details (required)", fr: "Détails (obligatoire)" },
    },
    sha: { required: true, value_type: "string", form_type: false },
    route: { required: true, value_type: "string", form_type: false },
    lang: { required: true, value_type: "string", form_type: false },
    app_version: { required: true, value_type: "string", form_type: false },
    client_id: { required: true, value_type: "string", form_type: false },
    additional: { required: false, value_type: "json", form_type: false },
  },
  loading: true,
  include_privacy: false,
};

export const FeedbackSimplified = Template.bind({});
FeedbackSimplified.args = {
  template: {
    meta: {
      subject_template:
        "Feedback Simplified: [${would_recommend}], [${useful_info}], ${lang}, ${route}, ${sha}, ${client_id}",
    },
    useful_info: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "To what extent did you find the spending information on GC InfoBase useful? (1=not at all useful and 5=very useful)",
        fr: "Dans quelle mesure avez-vous trouvé les renseignements financiers utiles dans InfoBase du GC? (1=inutile et 5=très utile)",
      },
      value_type: "enums",
      enum_values: {
        one: {
          en: "1",
          fr: "1",
        },
        two: {
          en: "2",
          fr: "2",
        },
        three: {
          en: "3",
          fr: "3",
        },
        four: {
          en: "4",
          fr: "4",
        },
        five: {
          en: "5",
          fr: "5",
        },
      },
      style: "horizontal",
    },
    would_recommend: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "How likely is it that you would recommend GC InfoBase to a friend or colleague? (1=not at all likely and 10=very likely)",
        fr: "Quelle est la probabilité que vous recommandiez GC InfoBase à un ami ou à un collègue? (1=pas du tout probable et 10=très probable)",
      },
      value_type: "enums",
      enum_values: {
        one: {
          en: "1",
          fr: "1",
        },
        two: {
          en: "2",
          fr: "2",
        },
        three: {
          en: "3",
          fr: "3",
        },
        four: {
          en: "4",
          fr: "4",
        },
        five: {
          en: "5",
          fr: "5",
        },
        six: {
          en: "6",
          fr: "6",
        },
        seven: {
          en: "7",
          fr: "7",
        },
        eight: {
          en: "8",
          fr: "8",
        },
        nine: {
          en: "9",
          fr: "9",
        },
        ten: {
          en: "10",
          fr: "10",
        },
      },
      style: "horizontal",
    },
    sha: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    route: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    lang: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    app_version: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    client_id: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    additional: {
      required: false,
      value_type: "json",
      form_type: false,
    },
  },
  loading: true,
  include_privacy: false,
};

export const Feedback = Template.bind({});
Feedback.args = {
  template: {
    meta: {
      subject_template:
        "Feedback: [${found_info}], [${easily_nav}], [${useful_info}], [${user_type}], [${device_type}], [${familiar_info}], ${would_recommend}, ${lang}, ${route}, ${sha}, ${client_id}",
    },

    found_info: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "Did you find what you were looking for on GC InfoBase?",
        fr: "Avez-vous trouvé ce que vous cherchiez dans InfoBase du GC?",
      },
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
    },
    found_info_details: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "If no, please specify what you were looking for.",
        fr: "Dans la négative, veuillez préciser ce que vous cherchiez.",
      },
      connection: {
        name: "found_info",
        enable: "no",
      },
    },

    easily_nav: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "To what extent did you find GC InfoBase easy to navigate? (1=not at all easy and 5=very easy)",
        fr: "Dans quelle mesure la navigation est-elle facile dans InfoBase du GC? (1=difficile et 5=très facile)",
      },
      value_type: "enums",
      enum_values: {
        one: {
          en: "1",
          fr: "1",
        },
        two: {
          en: "2",
          fr: "2",
        },
        three: {
          en: "3",
          fr: "3",
        },
        four: {
          en: "4",
          fr: "4",
        },
        five: {
          en: "5",
          fr: "5",
        },
      },
      style: "horizontal",
    },
    easily_nav_details: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "If you did not find it easy to navigate, please specify any difficulties you experienced.",
        fr: "Si vous n'avez pas trouvé facile de naviguer, précisez les difficultés que vous avez éprouvées.",
      },
    },

    useful_info: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "To what extent did you find the spending information on GC InfoBase useful? (1=not at all useful and 5=very useful)",
        fr: "Dans quelle mesure avez-vous trouvé les renseignements financiers utiles dans InfoBase du GC? (1=inutile et 5=très utile)",
      },
      value_type: "enums",
      enum_values: {
        one: {
          en: "1",
          fr: "1",
        },
        two: {
          en: "2",
          fr: "2",
        },
        three: {
          en: "3",
          fr: "3",
        },
        four: {
          en: "4",
          fr: "4",
        },
        five: {
          en: "5",
          fr: "5",
        },
      },
      style: "horizontal",
    },
    useful_info_details: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "If you did not find the information useful, please specify why.",
        fr: "Si les renseignements, à votre avis, n’étaient pas utiles, indiquez pourquoi.",
      },
    },

    user_type: {
      required: true,
      form_type: "checkbox",
      form_label: {
        en: "Please choose the type of user that best describes you (select all that apply):",
        fr: "Veuillez choisi le type d’utilisateur qui vous décrit le mieux (sélectionnez toutes les options qui s’appliquent) :",
      },
      value_type: "enums",
      enum_values: {
        academic: {
          en: "Academic/Researcher/Student",
          fr: "Universitaire / étudiant / chercheur",
        },
        federal: {
          en: "Federal public servant",
          fr: "Fonctionnaire fédéral",
        },
        journalist: {
          en: "Journalist",
          fr: "Journaliste",
        },
        public: {
          en: "Member of the general public",
          fr: "Membre du grand public",
        },
        gov: {
          en: "Member (or staff) of the Parliament of Canada",
          fr: "Député (ou membre du personnel) de la Chambre des communes ou du Sénat",
        },
        servant: {
          en: "Provincial/municipal public servant",
          fr: "Fonctionnaire provincial / municipal",
        },
        other: {
          en: "Other, please specify:",
          fr: "Autre, veuillez préciser :",
        },
      },
    },
    user_type_other: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "",
        fr: "",
      },
      connection: {
        name: "user_type",
        enable: "other",
      },
    },

    device_type: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "On which device did you access GC InfoBase?",
        fr: "Sur quel appareil avez-vous accédé à InfoBase du GC?",
      },
      value_type: "enums",
      enum_values: {
        phone: {
          en: "Mobile phone (e.g. smartphone)",
          fr: "Cellulaire (p. ex. téléphone intelligent)",
        },
        desktop: {
          en: "Desktop/Laptop computer",
          fr: "Ordinateur de bureau / portable",
        },
        tablet: {
          en: "Tablet (e.g. iPad)",
          fr: "Tablette (p. ex. iPad)",
        },
        other: {
          en: "Other, please specify:",
          fr: "Autre, veuillez préciser :",
        },
      },
    },
    device_type_other: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "",
        fr: "",
      },
      connection: {
        name: "device_type",
        enable: "other",
      },
    },

    familiar_info: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "How familiar are you with the type of information presented on GC InfoBase (i.e. federal spending, people management and results data)?",
        fr: "Dans quelle mesure connaissez-vous le type de renseignements présentés dans InfoBase du GC (c.-à-d. les données du gouvernement fédéral sur les dépenses, la gestion des personnes et les résultats)?",
      },
      value_type: "enums",
      enum_values: {
        none: {
          en: "Not at all",
          fr: "Pas du tout",
        },
        somewhat: {
          en: "Somewhat familiar",
          fr: "Modérément",
        },
        familar: {
          en: "Familiar",
          fr: "Bien",
        },
        very: {
          en: "Very Familiar",
          fr: "Très bien",
        },
      },
    },

    other_details: {
      required: false,
      value_type: "string",
      form_type: "textarea",
      form_label: {
        en: "We are always looking for ways to improve GC InfoBase! Please provide any other details about your experience.",
        fr: "Nous cherchons des moyens d’améliorer InfoBase du GC! Pourriez-vous nous donner d'autres détails sur votre expérience.",
      },
    },

    would_recommend: {
      required: true,
      form_type: "radio",
      form_label: {
        en: "How likely is it that you would recommend GC InfoBase to a friend or colleague? (1=not at all likely and 10=very likely)",
        fr: "Quelle est la probabilité que vous recommandiez GC InfoBase à un ami ou à un collègue? (1=pas du tout probable et 10=très probable)",
      },
      value_type: "enums",
      enum_values: {
        one: {
          en: "1",
          fr: "1",
        },
        two: {
          en: "2",
          fr: "2",
        },
        three: {
          en: "3",
          fr: "3",
        },
        four: {
          en: "4",
          fr: "4",
        },
        five: {
          en: "5",
          fr: "5",
        },
        six: {
          en: "6",
          fr: "6",
        },
        seven: {
          en: "7",
          fr: "7",
        },
        eight: {
          en: "8",
          fr: "8",
        },
        nine: {
          en: "9",
          fr: "9",
        },
        ten: {
          en: "10",
          fr: "10",
        },
      },
      style: "horizontal",
    },

    sha: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    route: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    lang: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    app_version: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    client_id: {
      required: true,
      value_type: "string",
      form_type: false,
    },
    additional: {
      required: false,
      value_type: "json",
      form_type: false,
    },
  },
  loading: true,
  include_privacy: false,
};

export const Test_Template = Template.bind({});
Test_Template.args = {
  template: {
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
  },
  loading: true,
  include_privacy: false,
};

export const Error = Template.bind({});
Error.args = {
  template: {
    meta: {
      subject_template: "[${error}]",
    },
    error: {
      required: true,
      form_type: "radio",
      form_label: {
        en: `An error has occured (TypeError)`,
        fr: `Une erreur est survenue (TypeError)`,
      },
    },
  },
  loading: true,
  include_privacy: false,
};

// meta: {
//   subject_template:
//     "Feedback Simplified: [${would_recommend}], [${useful_info}], ${lang}, ${route}, ${sha}, ${client_id}",
// },
// useful_info: {
//   required: true,
//   form_type: "radio",
//   form_label: {
//     en: "To what extent did you find the spending information on GC InfoBase useful? (1=not at all useful and 5=very useful)",
//     fr: "Dans quelle mesure avez-vous trouvé les renseignements financiers utiles dans InfoBase du GC? (1=inutile et 5=très utile)",
//   },
//   value_type: "enums",
//   },
//   style: "horizontal",
// },
// },
