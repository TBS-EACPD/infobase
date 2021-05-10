import _ from "lodash";
import React from "react";

import { create_text_maker } from "src/models/text";

import { services_feature_flag } from "src/core/injected_build_constants";

import {
  IconInfo,
  IconRelatedBubble,
  IconDataset,
  IconFinances,
  IconEmployees,
  IconServices,
  IconClipboard,
  IconTag,
  IconHelp,
} from "src/icons/icons";

import { infograph_href_template } from "./infographic_link";

import text from "./bubble_definitions.yaml";

const text_maker = create_text_maker(text);

// any config option, other than id, can either be a value or a function of the infographic subject
const base_configs = [
  {
    id: "intro",
    title: (subject) => text_maker(`about_${subject.level}_title`),
    description: "Introduction",
    Icon: IconInfo,
  },
  {
    id: "structure",
    title: text_maker("tagged_programs"),
    description: "",
    Icon: IconTag,
  },
  {
    id: "financial",
    title: text_maker("financial_title"),
    description: text_maker("financial_desc"),
    enable_panel_filter: true,
    Icon: IconFinances,
  },
  {
    id: "covid",
    title: text_maker("covid"),
    description: text_maker("covid_desc"),
    Icon: IconHelp,
  },
  {
    id: "people",
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
    enable_panel_filter: true,
    Icon: IconEmployees,
  },
  services_feature_flag && {
    id: "services",
    title: text_maker("services_title"),
    description: text_maker("services_desc"),
    Icon: IconServices,
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
