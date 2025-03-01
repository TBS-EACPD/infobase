import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { Datasets } from "src/models/metadata/Datasets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import text from "./orgTransferPayments.yaml";

const { std_years } = year_templates;
const { transfer_payments } = businessConstants;

export default {
  id: "orgTransferPayments",
  legacy_id: "table7",
  data_set: Datasets.transfer_payments,
  text,

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
        can_group_by: true,
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
        custom_groupings: {
          vote_vs_stat: {
            group_by: function (row) {
              return _.includes(row.tp, "(S) ");
            },
            grouping_col_value: function (row) {
              return [
                "type",
                trivial_text_maker(
                  _.includes(row.tp, "(S) ") ? "stat" : "voted"
                ),
              ];
            },
          },
        },
        can_group_by: true,
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
    _.each(std_years, (header) => {
      this.add_col(header).add_child([
        {
          type: "big_int",
          nick: header + "auth",
          header: {
            en: "Total budgetary authority available for use",
            fr: "Autorisations budgétaires disponibles pour l'emploi",
          },
          description: {
            en: "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year.",
            fr: "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d'autres organismes ou les rajustements qui ont été effectués au cours de l'exercice.",
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
            en: "Corresponds to the funds spent against authorities available that year.",
            fr: "Correspondent aux dépenses par rapport aux autorisations disponibles cette année-là.",
          },
        },
      ]);
    });
  },

  sort: function (mapped_rows) {
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
