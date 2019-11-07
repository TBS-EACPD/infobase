import text from './orgSobjsQfr.yaml';
import { businessConstants } from '../models/businessConstants';

const { sos } = businessConstants;

import { trivial_text_maker } from '../models/text';

export default {
  text,
  id: "orgSobjsQfr",
  legacy_id: "table2",
  source: [ "QFR" ],
  "tags": [
    "QFR",
    "SPENDING_RATE",
    "EXP",
    "SOBJ",
    "QUARTERLY",
  ],

  "link": {
    en: "http://open.canada.ca/data/en/dataset/d2655168-d178-46ea-8b7f-03c4d01e4508",
    fr: "http://ouvert.canada.ca/data/fr/dataset/d2655168-d178-46ea-8b7f-03c4d01e4508",
  },

  "name": { 
    "en": "Expenditures by Standard Object (QFR)",
    "fr": "Dépenses par article courant (RFT)",
  },

  "title": { 
    "en": "Expenditures by Standard Object (QFR) ($)",
    "fr": "Dépenses par article courant (RFT) (en dollars)",
  },

  rpb_banner: trivial_text_maker("temp_qfr_late_depts_note"),

  "add_cols": function(){
    this.add_col("")
      .add_child([
        {
          "type": "int",
          "key": true,
          "hidden": true,
          "nick": "dept",
          "header": '',
        },
        {
          "key": true,
          "type": "int",
          "hidden": true,
          "nick": 'so_num',
          "header": {
            "en": "Standard Object",
            "fr": "Article courtant",
          },
        },
        {
          "key": true,
          "type": "str",
          "nick": "so",
          "header": {
            "en": "Standard Object",
            "fr": "Article Courant",
          },
        },
      ]);
    this.add_col("{{qfr_in_year}}")
      .add_child([
        {
          "type": "big_int",
          "nick": "plannedexp",
          "header": {
            "en": "Planned expenditures for the year ending {{qfr_in_year_end}}",
            "fr": "Dépenses prévues pour l'exercice se terminant le {{qfr_in_year_end}}",
          },
          "description": {
            "en": "Corresponds to the planned expenditures tabled by the organization in their QFR for the fiscal year ending on {{mar_31}} of the relevant year.",
            "fr": "Correspondent aux dépenses prévues présentées par l'organisation dans son rapport financier trimestriel (RFT) pour l’exercice se terminant le {{mar_31}} de l’année pertinente.",
          },
        },
        {
          "type": "big_int",
          "nick": 'thisyear_quarterexpenditures',
          "header": {
            "en": "Expended during the quarter ended {{qfr_month_name}}, {{qfr_in_year_short_first}}",
            "fr": "Dépenses engagées durant le trimestre terminé le {{qfr_month_name}} {{qfr_in_year_short_first}}",
          },
          "description": {
            "en": "Represents the expenditures that have been made for the selected quarter.",
            "fr": "Représentent les dépenses effectuées au cours du trimestre sélectionné.",
          },
        },
        {
          "type": "big_int",
          "simple_default": true,
          "nick": "in_year_ytd-exp",
          "header": {
            "en": "Year to date used at quarter-end",
            "fr": "Cumul des crédits utilisés à la fin du trimestre",
          },
          "description": {
            "en": "Represents the sum of all spending made by the organization up to the specified period.",
            "fr": "Représente la somme des dépenses effectuées par l’organisation du début de l’exercice jusqu’à la fin de la période indiquée.",
          },
        },
      ]);
    this.add_col("{{qfr_last_year}}")
      .add_child([
        {
          "type": "big_int",
          "nick": "last_year_plannedexp",
          "header": {
            "en": "Planned expenditures for the year ending {{qfr_last_year_end}}",
            "fr": "Dépenses prévues pour l'exercice se terminant le {{qfr_last_year_end}}",
          },
          "description": {
            "en": "Corresponds to the planned expenditures tabled by the organization in their QFR for the fiscal year ending on {{mar_31}} of the relevant year.",
            "fr": "Correspondent aux dépenses prévues présentées par l'organisation dans son rapport financier trimestriel (RFT) pour l’exercice se terminant le {{mar_31}} de l’année pertinente.",
          },
        },
        {
          "type": "big_int",
          "nick": 'lastyear_quarterexpenditures',
          "header": {
            "en": "Expended during the quarter ended {{qfr_month_name}}, {{qfr_last_year_short_first}}",
            "fr": "Dépensées durant le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short_first}}",
          },
          "description": {
            "en": "Represents the expenditures that have been made for the selected quarter.",
            "fr": "Représentent les dépenses effectuées au cours du trimestre sélectionné.",
          },
        },
        {
          "type": "big_int",
          "nick": "last_year_ytd-exp",
          "header": {
            "en": "Year to date used at quarter-end",
            "fr": "Cumul des crédits utilisés à la fin du trimestre",
          },
          "description": {
            "en": "Represents the sum of all spending made by the organization up to the specified period.",
            "fr": "Représente la somme des dépenses effectuées par l’organisation du début de l’exercice jusqu’à la fin de la période indiquée.",
          },
        },
      ]);
  },

  "dimensions": [
    {
      title_key: "so",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return row.so;
        };
      },
    },
    {
      title_key: "so_cat",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          if (row.so_num > 0 && row.so_num <= 7){
            return trivial_text_maker("op_spending");
          } else if (row.so_num > 7 && row.so_num <= 9) {
            return trivial_text_maker("capital_spending");
          } else if (row.so_num === 21 || row.so_num === 22) {
            return trivial_text_maker("revenues");
          }
          return row.so;
        };
      },
    },
  ],

  "mapper": function (row) {
    if (row[0] !== 'ZGOC') {
      row.splice(2, 0, sos[row[1]].text);
    }
    return row;
  },
};
