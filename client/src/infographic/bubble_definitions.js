import { create_text_maker } from "../models/text.js";

import { infograph_href_template } from "./infographic_link.js";

import text from "./bubble_definitions.yaml";
import svgs from "./bubble_svgs.yaml";

const text_maker = create_text_maker(text);

const get_svg_content = (bubble_id) => _.get(svgs, `${bubble_id}.text`);

// any config option can either be a value or a function (which will be passed the contextual infographic subject)
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
  },
  {
    id: "people",
  },
  {
    id: "results",
  },
  {
    id: "related",
  },
  {
    id: "all_data",
    title: text_maker("datasets"),
  },
];

// Webpack error with the rest arg here?

const bubble_defs = _.chain(base_configs)
  .map(({ id, ...optional }) => [
    {
      id,
      title: _.get(optional, "title", text_maker(`${id}_title`)),
      description: _.get(optional, "description", text_maker(`${id}_desc`)),
      href: (subject) => infograph_href_template(subject, id),
      svg_content: get_svg_content(id),
    },
  ])
  .value();

export { bubble_defs };
