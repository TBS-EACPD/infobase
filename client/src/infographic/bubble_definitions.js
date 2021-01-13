import _ from "lodash";

import { create_text_maker } from "../models/text.js";

import { infograph_href_template } from "./infographic_link.js";

import text from "./bubble_definitions.yaml";
import svgs from "./bubble_svgs.yaml"; // TODO: use icon componenets instead (some of these are already icon components, some not)

const text_maker = create_text_maker(text);

const get_svg_content = (bubble_id) => _.get(svgs, `${bubble_id}.text`);

// any config option, other than id, can either be a value or a function of the infographic subject
const base_configs = [
  {
    id: "intro",
    title: (subject) => text_maker(`about_${subject.level}_title`),
    description: "Introduction",
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
  },
  {
    id: "people",
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
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
  },
  {
    id: "all_data",
    title: text_maker("all_data_title"),
    description: text_maker("all_data_desc"),
  },
];

const bubble_defs = _.map(base_configs, (base) => ({
  ...base,
  href: (subject) => infograph_href_template(subject, base.id),
  svg_content: get_svg_content(base.id),
}));

export { bubble_defs };
