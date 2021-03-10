import _ from "lodash";

import {
  IconAbout,
  IconRelatedBubble,
  IconDataset,
  IconMoney,
  IconEmployee,
  IconServices,
  IconClipboard,
} from "src/icons/icons.js";

import { services_feature_flag } from "../core/injected_build_constants.js";
import { create_text_maker } from "../models/text.js";

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
    id: "people",
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
    enable_panel_filter: true,
    svg: IconEmployee,
  },
  services_feature_flag && {
    id: "services",
    title: text_maker("services_title"),
    description: text_maker("services_desc"),
    enable_panel_filter: true,
    svg: IconServices,
  },
  {
    id: "results",
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
    svg: IconClipboard,
  },
  {
    id: "results",
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
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
