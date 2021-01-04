// see [here](../table_definition.html) for description
// of the table spec
import _ from "src/app_bootstrap/lodash_mixins.js";

import {
  trivial_text_maker,
  year_templates,
  businessConstants,
} from "./table_common";

import text from "./orgTransferPayments.yaml";

const { std_years } = year_templates;
const { transfer_payments } = businessConstants;

export default {
  text,
  id: "orgTransferPayments",
  legacy_id: "table7",
  tags: ["AUTH", "EXP", "PA", "VOTED", "STAT", "SOBJ10", "ANNUAL"],

  source: ["PA"],
  name: {
    en: "Transfer Payments",
    fr: "Paiements de transfert",
  },

  title: {
    en: "Transfer Payments from {{pa_last_year_5}} to {{pa_last_year}} ($)",
    fr:
      "Paiements de transfert de {{pa_last_year_5}} à {{pa_last_year}} (en dollars)",
  },

  add_cols: function () {
    this.add_col({
      header: {
        en: "Transfer Payment",
        fr: "Paiement de transfert",
      },
    }).add_child([
      {
        type: "int",
        key: true,
        hidden: true,
        nick: "dept",
        header: "",
      },
      {
        type: "str",
        hidden: true,
        key: true,
        nick: "type_id",
      },
      {
        type: "str",
        key: true,
        nick: "type",
        header: {
          en: "Type",
          fr: "Type",
        },
      },
      {
        type: "wide-str",
        key: true,
        nick: "tp",
        header: {
          en: "Name",
          fr: "Nom",
        },
      },
    ]);
    _.each(std_years, (header, i) => {
      this.add_col(header).add_child([
        {
          type: "big_int",
          nick: header + "auth",
          header: {
            en: "Total budgetary authority available for use",
            fr: "Autorisations budgétaires disponibles pour l'emploi",
          },
          description: {
            en:
              "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year.",
            fr:
              "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d'autres organismes ou les rajustements qui ont été effectués au cours de l'exercice.",
          },
        },
        {
          type: "big_int",
          nick: header + "exp",
          header: {
            en: "Expenditures",
            fr: "Dépenses",
          },
          description: {
            en:
              "Corresponds to the funds spent against authorities available that year.",
            fr:
              "Correspondent aux dépenses par rapport aux autorisations disponibles cette année-là.",
          },
        },
      ]);
    });
  },

  dimensions: [
    {
      title_key: "payment_types_v_s",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          var type = row.type;
          if (
            row.tp.substring(0, 3) === "(S)" ||
            row.tp.substring(0, 3) === "(L)"
          ) {
            return type + " - " + trivial_text_maker("stat");
          } else {
            return type + " - " + trivial_text_maker("voted");
          }
        };
      },
    },
    {
      title_key: "payment_types",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.type;
        };
      },
    },
    {
      title_key: "payment_type_ids",
      filter_func: function (options) {
        return function (row) {
          return row.type_id;
        };
      },
    },
  ],

  queries: {
    types: function () {
      return _.uniqBy(this.get_cols(["type"]).type);
    },
  },

  sort: function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) {
      return [row.type, row.tp];
    });
  },

  mapper: function (row) {
    const type_name = transfer_payments[row[1]].text;
    row.splice(2, 0, type_name);
    if (this.lang === "en") {
      row.splice(4, 1);
    } else {
      row.splice(3, 1);
    }
    // remove acronym and vote type
    return row;
  },
};
