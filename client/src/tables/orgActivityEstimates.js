import text from './orgActivityEstimates.yaml';
import {
  Subject,
  years,
  businessConstants,
} from './table_common';
const { CRSO } = Subject;
const { cr_estimates_years } = years;
import { create_text_maker } from '../models/text.js';

const { estimates_docs } = businessConstants;

const text_maker = create_text_maker(text);

const map_helper = {
  "ME": "MAINS",
};

export default {
  text,
  id: "orgActivityEstimates",
  legacy_id: "",
  tags: [
    "AUTH",
    "EST_PROC",
    "PLANNED_EXP_TAG",
    "CR",
  ],

  source: ["ESTIMATES"],

  "name": {
    "en": "Tabled Estimates by Core Responsibility",
    "fr": "Budgets déposés par responsabilité essentielle",
  },

  "title": {
    "en": "Tabled Estimates by Core Responsibility ($000)",
    "fr": "Budgets déposés par responsabilité essentielle (en milliers de dollars)",
  },

  "footnote-topics": {
    "group": ["mains_text"],
    "table": ["~main_text","mains_text_gov"],
  },

  "add_cols": function(){
    this.add_col({
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col({
      "type": "str",
      "key": true,
      "hidden": true,
      "nick": "crso_id",
    });
    this.add_col({
      "type": "wide-str",
      "key": true,
      "nick": "cr_name",
      "header": {
        "en": "Core Responsibility",
        "fr": "Responsabilité Essentielle",
      },
    });
    this.add_col({
      "type": "wide-str",
      "key": true,
      "nick": "est_doc",
      "header": {
        "en": "Estimates Instrument",
        "fr": "Instrument des dépenses",
      },
    });
    _.each(cr_estimates_years, (yr, ix) => { 
      this.add_col({
        "simple_default": ix === 1,
        type: "big_int",
        nick: yr+"_estimates",
        description: {
          en: "Tabled Amounts for "+yr,
          fr: "Montants déposés pour "+yr,
        },
        header: yr,
      });
    });
  },

  "mapper": function (row) {	
    if (row[2] in map_helper) { 
      row[2] = map_helper[row[2]]; 
    }
    row.splice(2, 1, estimates_docs[row[2]][window.lang]);

    // fake CRSO id for budget items
    if(row[1].split('-')[1]==="BUDIM"){
      row.splice(2,0,text_maker("budget_measure"));
    } else {
      const cr = CRSO.get_from_id(row[1]);
      cr && row.splice(2,0,cr.name);
    }
    return row;
  },

  "dimensions": [
    {
      title_key: "by_estimates_doc",
      include_in_report_builder: true,
      filter_func: function(options){
        return function(d){
          return d.est_doc;
        };
      },
    },
  ],
};

