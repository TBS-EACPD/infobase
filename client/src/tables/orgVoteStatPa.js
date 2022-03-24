import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import text from "./orgVoteStatPa.yaml";

const { std_years } = year_templates;

export default {
  text,
  id: "orgVoteStatPa",
  legacy_id: "table4",
  tags: ["PA", "AUTH", "EXP", "VOTED", "STAT", "ANNUAL"],

  source: ["PA"],
  name: {
    en: "Authorities and Expenditures",
    fr: "Autorisations et dépenses",
  },

  add_cols: function () {
    this.add_col({
      header: {
        en: "Vote {{pa_last_year}} / Statutory",
        fr: "Crédit {{pa_last_year}} / Poste législatif",
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
        type: "int",
        key: true,
        hidden: true,
        nick: "votenum",
        header: {
          en: "Number",
          fr: "Numéro",
        },
      },
      {
        type: "int",
        key: true,
        hidden: true,
        nick: "votestattype",
        header: "",
      },
      {
        type: "wide-str",
        key: true,
        nick: "desc",
        header: {
          en: "Description",
          fr: "Description",
        },
        custom_groupings: {
          vote_vs_stat: {
            group_by: function (row) {
              return row.votestattype === 999;
            },
            grouping_col_value: function (row) {
              return [
                "desc",
                trivial_text_maker(row.votestattype === 999 ? "stat" : "voted"),
              ];
            },
          },
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
            fr: "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d’autres organisations ou les rajustements qui ont été effectués au cours de l’exercice.",
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
            fr: "Correspondent aux dépenses effectuées aux termes de autorisations disponibles cette année-là.",
          },
        },
        {
          type: "big_int",
          nick: header + "unlapsed",
          hidden: true,
        },
      ]);
    });
  },

  sort: function (mapped_rows) {
    var grps = _.groupBy(mapped_rows, function (row) {
      return _.isNumber(row.votenum);
    });
    // grps[true]  ==> voted rows
    // grps[false] ==> stat rows
    if (_.has(grps, false)) {
      grps[false] = _.sortBy(grps[false], function (row) {
        return row[0];
      });
    } else {
      grps[false] = [];
    }
    if (_.has(grps, true)) {
      grps[true] = _.sortBy(grps[true], function (row) {
        return row.votenum;
      });
    } else {
      grps[true] = [];
    }
    return grps[true].concat(grps[false]);
  },

  mapper: function (row) {
    if (this.lang === "en") {
      row.splice(4, 1);
    } else {
      row.splice(3, 1);
    }
    if (+row[2] !== 999 && row[0] !== "ZGOC") {
      row[3] = row[3] + " - " + row[1];
    }
    return row;
  },
};
