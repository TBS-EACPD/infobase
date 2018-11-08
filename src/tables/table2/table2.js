import text from './table2.yaml';
import { Statistics } from '../../core/Statistics.js';
import { businessConstants } from '../../models/businessConstants';

const { sos } = businessConstants;

// see [here](../table_definition.html) for description
// of the table spec
import { stats } from '../../core/tables/stats.js';
import { trivial_text_maker } from '../../models/text.js';

export default {
  text,
  id: "table2",
  source: [ "QFR" ],
  "tags": [
    "QFR",
    "SPENDING_RATE",
    "EXP",
    "PEOPLE",
    "SOBJ",
  ],

  "link": {
    en: "http://open.canada.ca/data/en/dataset/d2655168-d178-46ea-8b7f-03c4d01e4508",
    fr: "http://ouvert.canada.ca/data/fr/dataset/d2655168-d178-46ea-8b7f-03c4d01e4508",
  },

  "name": { 
    "en": "Expenditures by Standard Object (QFR)",
    "fr": "Dépenses par article courant (Rapports Financiers Trimestriels)",
  },

  "title": { 
    "en": "Expenditures by Standard Object (QFR) ($000)",
    "fr": "Dépenses par article courant (Rapports Financiers Trimestriels) (en milliers de dollars)",
  },

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

Statistics.create_and_register({
  id: 'table2_dept_info', 
  table_deps: [ 'table2'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table2;
    const q = table.q(subject);
    c.dept = subject;

    var all_ordered_so = q.get_top_x(
      ["so","in_year_ytd-exp"], 
      Infinity,
      {
        zip: true,
        sort_col: "in_year_ytd-exp",
        reverse: true,
      }
    );
    stats.one_year_top2_bottom1(add, "qfr_so",all_ordered_so);

  },
});

Statistics.create_and_register({
  id: 'table2_gov_info', 
  table_deps: [ 'table2'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table2;
    const q = table.q(subject);
    var all_ordered_so = q.get_top_x(
      ["so","in_year_ytd-exp"], 
      Infinity,
      {
        zip: true,
        sort_col: "in_year_ytd-exp",
        reverse: true,
      }
    );
    stats.one_year_top2_bottom1(add, "qfr_so",all_ordered_so);
  },
});

