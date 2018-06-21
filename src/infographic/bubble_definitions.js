import text from './bubble_definitions.yaml';
import { trivial_text_maker as text_maker } from '../models/text.js';

export const bubble_defs = {
  intro: {
    ix: 0,
    id: 'intro',
    tables: [],
    svg_url: `${CDN_URL}/svg/bub_intro.svg`,
    title(subject){
      switch(subject.level){
        case 'program':
          return text.about_dept_title[lang];
        case 'gov':
          return text.about_gov_title[lang];
        case 'tag': 
          return text.about_tag_title[lang];
        case 'crso': 
          if(subject.dept.dp_status === "fw"){
            return (
              window.lang === 'en' ? 
              "About this "+ subject.singular() :
              "À propos de cette "+ subject.singular() 
            );
          } else {
            return (
              window.lang === 'en' ? 
              "About this "+ subject.singular() :
              "À propos de ce "+ subject.singular() 
            );
          }
        default:
          return "Introduction";
      }
    },
    description: _.constant(""),
  },
  structure:{
    ix: 3,
    id: 'structure',
    title(subject){
      if(subject.level === 'tag'){
        return text_maker('tagged_programs');
      } else {
        throw "TODO"
      }
    },
    description: _.constant(""),
    tables: [],
    svg_url: `${CDN_URL}/svg/bub_structure.svg`,
  },
  financial : {
    ix: 5,
    id : "financial",
    title: _.constant(text.fin_title[lang]),
    // slightly modify the description for Financial data for ib plus
    description: _.constant(text.fin_desc[lang]),
    tables: [],
    svg_url: `${CDN_URL}/svg/bub_financial.svg`,
  },
  people:  {
    ix: 10,
    id : 'people',
    title: _.constant(text.people_title[lang]),
    description: _.constant(text.people_desc[lang]),
    tables: [],
    svg_url: `${CDN_URL}/svg/bub_people.svg`,
  },
  results: {
    ix: 15,
    id : "results",
    title: _.constant(text.planning_title[lang]),
    description: _.constant(text.planning_desc[lang]),
    tables: [],
    svg_url: `${CDN_URL}/svg/bub_results.svg`,
  },
  related: {
    ix: 20,
    id: 'related',
    title: _.constant(text.where_can_i_go_title[lang]),
    description: _.constant(text.where_can_i_go_desc[lang]),
    tables: [],
    color: "#114B5F",
    svg_url: `${CDN_URL}/svg/bub_related.svg`,
  },
  all_data: {
    ix: 25,
    id: 'all_data',
    tables: [],
    color: "#009652",
    title: ({level}) => text[`all_data_${level}_title`][lang],
    description : _.constant(text.all_data_description[lang]),
    svg_url: `${CDN_URL}/svg/bub_all_data.svg`,
  },

};

