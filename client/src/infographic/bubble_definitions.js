import { create_text_maker } from "../models/text.js";

import text from "./bubble_definitions.yaml";
import svgs from "./bubble_svgs.yaml";

const text_maker = create_text_maker(text);

export const bubble_defs = {
  intro: {
    ix: 0,
    id: "intro",
    svg_content: svgs.intro.text,
    title: ({ level }) => text_maker(`about_${level}_title`),
    description: _.constant(""),
  },
  structure: {
    ix: 3,
    id: "structure",
    title: () => text_maker("tagged_programs"),
    description: _.constant(""),
    svg_content: svgs.structure.text,
  },
  financial: {
    ix: 5,
    id: "financial",
    title: () => text_maker("fin_title"),
    description: () => text_maker("fin_desc"),
    svg_content: svgs.financial.text,
  },
  people: {
    ix: 10,
    id: "people",
    title: () => text_maker("people_title"),
    description: () => text_maker("people_desc"),
    svg_content: svgs.people.text,
  },
  results: {
    ix: 15,
    id: "results",
    title: () => text_maker("results_title"),
    description: () => text_maker("results_desc"),
    svg_content: svgs.results.text,
  },
  related: {
    ix: 20,
    id: "related",
    title: () => text_maker("where_can_i_go_title"),
    description: () => text_maker("where_can_i_go_desc"),
    color: "#114B5F",
    svg_content: svgs.related.text,
  },
  all_data: {
    ix: 25,
    id: "all_data",
    color: "#009652",
    title: () => text_maker("datasets"),
    description: () => text_maker("all_data_description"),
    svg_content: svgs.all_data.text,
  },
};
