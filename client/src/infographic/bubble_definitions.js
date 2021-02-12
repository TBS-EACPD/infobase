import _ from "lodash";
import React from "react";

import { create_text_maker } from "src/models/text.js";

import {
  IconAbout,
  IconRelatedBubble,
  IconDataset,
  IconMoney,
  IconEmployee,
  IconClipboard,
} from "src/icons/icons.js";


import { infograph_href_template } from "./infographic_link.js";

import text from "./bubble_definitions.yaml";

const text_maker = create_text_maker(text);

// any config option, other than id, can either be a value or a function of the infographic subject
const base_configs = [
  {
    id: "intro",
    title: (subject) => text_maker(`about_${subject.level}_title`),
    description: "Introduction",
    Icon: IconAbout,
  },
  {
    id: "structure",
    title: text_maker("tagged_programs"),
    description: "",
    Icon: IconAbout, //TODO
  },
  {
    id: "financial",
    title: text_maker("financial_title"),
    description: text_maker("financial_desc"),
    enable_panel_filter: true,
    Icon: IconMoney,
  },
  {
    id: "covid",
    title: text_maker("covid_response"),
    description: text_maker("covid_desc"),
    Icon: IconAbout, //TODO
  },
  {
    id: "people",
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
    enable_panel_filter: true,
    Icon: IconEmployee,
  },
  {
    id: "results",
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
    Icon: IconClipboard,
  },
  {
    id: "related",
    title: text_maker("related_title"),
    description: text_maker("related_desc"),
    Icon: IconRelatedBubble,
  },
  {
    id: "all_data",
    title: text_maker("all_data_title"),
    description: text_maker("all_data_desc"),
    Icon: IconDataset,
  },
];

const get_bubble_defs = (subject) =>
  _.chain(base_configs)
    .map((base) => ({
      ..._.mapValues(base, (option) => {
        if (_.isFunction(option)) {
          const resolved_option = option(subject);
          if (!React.isValidElement(resolved_option)) {
            return resolved_option;
          }
        }
        return option;
      }),
      href: infograph_href_template(subject, base.id),
    }))
    .value();

export { get_bubble_defs };
