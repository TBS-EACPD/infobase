import text from './bubble_definitions.yaml';
import svgs from './bubble_svgs.yaml';
import { trivial_text_maker as text_maker } from '../models/text.js';

export const bubble_defs = {
  intro: {
    ix: 0,
    id: 'intro',
    tables: [],
    svg_content: svgs.intro.text,
    title(subject){
      switch(subject.level){
        case 'program':
          return text.about_program_title[lang];
        case 'gov':
          return text.about_gov_title[lang];
        case 'tag': 
          return text.about_tag_title[lang];
        case 'crso': 
          return text.about_cr_title[lang];
        default:
          return "Introduction";
      }
    },
    description: _.constant(""),
  },
  structure: {
    ix: 3,
    id: 'structure',
    title(subject){
      if(subject.level === 'tag'){
        return text_maker('tagged_programs');
      } else {
        throw "TODO";
      }
    },
    description: _.constant(""),
    tables: [],
    svg_content: svgs.structure.text,
  },
  financial: {
    ix: 5,
    id: "financial",
    title: _.constant(text.fin_title[lang]),
    // slightly modify the description for Financial data for ib plus
    description: _.constant(text.fin_desc[lang]),
    tables: [],
    svg_content: svgs.financial.text,
  },
  people: {
    ix: 10,
    id: 'people',
    title: _.constant(text.people_title[lang]),
    description: _.constant(text.people_desc[lang]),
    tables: [],
    svg_content: svgs.people.text,
  },
  results: {
    ix: 15,
    id: "results",
    title: _.constant(text.planning_title[lang]),
    description: _.constant(text.planning_desc[lang]),
    tables: [],
    svg_content: svgs.results.text,
  },
  services: {
    ix: 17,
    id: "services",
    title: _.constant(text.services_title[lang]),
    description: _.constant(text.services_desc[lang]),
    tables: [],
    svg_content: svgs.services.text,
  },
  related: {
    ix: 20,
    id: 'related',
    title: _.constant(text.where_can_i_go_title[lang]),
    description: _.constant(text.where_can_i_go_desc[lang]),
    tables: [],
    color: "#114B5F",
    svg_content: svgs.related.text,
  },
  all_data: {
    ix: 25,
    id: 'all_data',
    tables: [],
    color: "#009652",
    title: ({level}) => text[`all_data_${level}_title`][lang],
    description: _.constant(text.all_data_description[lang]),
    svg_content: svgs.all_data.text,
  },

};

