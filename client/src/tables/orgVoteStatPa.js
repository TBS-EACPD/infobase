// see [here](../table_definition.html) for description
// of the table spec
import _ from "lodash";

import d3 from "src/app_bootstrap/d3-bundle.js";

import { trivial_text_maker } from "../models/text.js";

import {
  vote_stat_dimension,
  major_vote_stat,
  m,
  year_templates,
} from "./table_common";

import text from "./orgVoteStatPa.yaml";

const { std_years } = year_templates;
const voted_label = trivial_text_maker("voted");
const stat_label = trivial_text_maker("stat");

const vote_stat_query = function (vote_or_stat, cut_off) {
  var total = 0;
  var cut_off_counter = 0;
  var dept = this.dept || true;

  return _.chain(this.table.voted_stat(undefined, dept, false)[vote_or_stat])
    .map(_.clone)
    .flatten()
    .sortBy(function (d) {
      d.total = d3.sum(
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
    en:
      "Authorities and Actual Expenditures from {{pa_last_year_5}} to {{pa_last_year}} ($)",
    fr:
      "Autorisations et dépenses réelles {{pa_last_year_5}} à {{pa_last_year}} (en dollars)",
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
              "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d’autres organisations ou les rajustements qui ont été effectués au cours de l’exercice.",
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
              "Correspondent aux dépenses effectuées aux termes de autorisations disponibles cette année-là.",
          },
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

  dimensions: [
    {
      title_key: "major_voted_stat",
      include_in_report_builder: true,
      filter_func: major_vote_stat,
    },
    {
      title_key: "voted_stat",
      include_in_report_builder: true,
      filter_func: vote_stat_dimension,
    },
  ],

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
