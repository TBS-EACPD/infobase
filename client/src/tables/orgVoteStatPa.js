import { sum } from "d3-array";
import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { text_maker, m, year_templates } from "./table_common";

import text from "./orgVoteStatPa.yaml";

const { std_years } = year_templates;
const voted_label = trivial_text_maker("voted");
const stat_label = trivial_text_maker("stat");

const vote_stat_query = function (vote_or_stat, cut_off) {
  var total = 0;
  var cut_off_counter = 0;
  var dept = this.dept || true;

  return _.chain(
    this.table.sum_cols_by_grouped_data(std_years, "vote_vs_stat", dept)[
      vote_or_stat
    ]
  )
    .map(_.clone)
    .flatten()
    .sortBy(function (d) {
      d.total = sum(
        _.map(std_years, function (year) {
          return d[year + "auth"];
        })
      );
      total += d.total;
      return -d.total;
    })
    .each(function (d) {
      d.percent = d.total / total;
    })
    .each(function (d) {
      if (!cut_off) {
        return;
      }
      cut_off_counter += d.percent;
      d.cut_off = cut_off_counter >= cut_off ? true : false;
    })
    .value();
};

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

  title: {
    en: "Authorities and Actual Expenditures from {{pa_last_year_5}} to {{pa_last_year}} ($)",
    fr: "Autorisations et dépenses réelles {{pa_last_year_5}} à {{pa_last_year}} (en dollars)",
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
                text_maker(row.votestattype === 999 ? "stat" : "voted"),
              ];
            },
          },
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

  queries: {
    exp_auth_by_year: function (year, format) {
      format = format === undefined ? false : true;
      var vals = this.sum([year + "auth", year + "exp"], { format: format });
      return [m(year), vals[year + "auth"], vals[year + "exp"]];
    },
    voted_items: function (cut_off) {
      this.vote_stat_query = vote_stat_query;
      return this.vote_stat_query(voted_label, cut_off);
    },
    stat_items: function (cut_off) {
      this.vote_stat_query = vote_stat_query;
      return this.vote_stat_query(stat_label, cut_off);
    },
  },

  sort: function (mapped_rows, lang) {
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
