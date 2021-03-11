import _ from "lodash";

import {
  trivial_text_maker,
  businessConstants,
  year_templates,
} from "./table_common.js";

import text from "./orgSobjs.yaml";

// see [here](../table_definition.html) for description
// of the table spec

const { sos } = businessConstants;
const { std_years } = year_templates;

export default {
  text,
  id: "orgSobjs",
  legacy_id: "table5",
  tags: ["SOBJ", "EXP", "PA", "ANNUAL"],
  source: ["PA"],
  name: {
    en: "Expenditures by Standard Object",
    fr: "Dépenses par article courant",
  },

  title: {
    en:
      "Expenditures by Standard Object from {{pa_last_year_5}} to {{pa_last_year}} ($)",
    fr:
      "Dépenses par article courant de {{pa_last_year_5}} à {{pa_last_year}} (en dollars)",
  },

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
    });
    this.add_col({
      key: true,
      type: "int",
      hidden: true,
      nick: "so_num",
      header: {
        en: "Standard Object",
        fr: "Article courtant",
      },
    });
    this.add_col({
      key: true,
      type: "str",
      nick: "so",
      header: {
        en: "Standard Object",
        fr: "Article courtant",
      },
    });
    _.each(std_years, (header, i) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: header,
        description: {
          en:
            "Corresponds to the funds spent by standard object in the fiscal year " +
            header,
          fr:
            "Correspond aux dépenses effectuées par article courant durant l'exercice financier " +
            header,
        },
      });
    });
  },

  sort: function (rows, lang) {
    return _.sortBy(rows, function (row) {
      return row.so_num;
    });
  },

  mapper: function (row) {
    if (row[0] !== "ZGOC") {
      row.splice(2, 0, sos[row[1]].text);
    }
    return row;
  },

  dimensions: [
    {
      //TODO get rid of this one, we should only be using so_num, not so
      title_key: "so",

      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.so;
        };
      },
    },
    {
      title_key: "so_cat",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          if (row.so_num > 0 && row.so_num <= 7) {
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
    {
      title_key: "so_num",
      filter_func: () => _.property("so_num"),
    },
  ],
};
