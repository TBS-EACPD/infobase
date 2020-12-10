import _ from "lodash";

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
    svg: IconAbout,
  },
  {
    id: "structure",
    title: text_maker("tagged_programs"),
    description: "",
  },
  {
    id: "financial",
    title: text_maker("financial_title"),
    description: text_maker("financial_desc"),
    enable_panel_filter: true,
    svg: IconMoney,
  },
  {
    id: "covid",
    title: text_maker("covid_title"),
    description: text_maker("covid_desc"),
  },
  {
    id: "people",
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
    enable_panel_filter: true,
    svg: IconEmployee,
  },
  {
    id: "results",
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
    svg: IconClipboard,
  },
  {
    id: "related",
    title: text_maker("related_title"),
    description: text_maker("related_desc"),
    svg: IconRelatedBubble,
  },
  {
    id: "all_data",
    title: text_maker("all_data_title"),
    description: text_maker("all_data_desc"),
    svg: IconDataset,
  },
];

const bubble_defs = _.map(base_configs, (base) => ({
  ...base,
  href: (subject) => infograph_href_template(subject, base.id),
}));

export { bubble_defs };
