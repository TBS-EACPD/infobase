import text from "./orgVoteStatQfr.yaml";

import { vote_stat_dimension, major_vote_stat } from "./table_common";

import * as FORMAT from "../core/format";

import { trivial_text_maker } from "../models/text";

export default {
  text,
  id: "orgVoteStatQfr",
  legacy_id: "table1",
  source: ["QFR"],
  tags: ["QFR", "SPENDING_RATE", "AUTH", "EXP", "VOTED", "STAT", "QUARTERLY"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/cd7ba75e-e0a2-400b-906e-5b2608900f71",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/cd7ba75e-e0a2-400b-906e-5b2608900f71",
  },

  name: {
    en: "Authorities and Expenditures (QFR)",
    fr: "Autorisations et dépenses (RFT)",
  },

  title: {
    en: "Authorities and Expenditures (QFR) ($)",
    fr: "Autorisations et dépenses (RFT) (en dollars)",
  },

  rpb_banner: trivial_text_maker("temp_qfr_late_depts_note"),

  add_cols: function () {
    this.add_col({
      header: {
        en: "Vote / Statutory",
        fr: "Crédit / Statutaire",
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
        nick: "votenum",
        hidden: true,
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
        nick: "desc",
        key: true,
        header: {
          en: "Description",
          fr: "Description",
        },
      },
    ]);
    this.add_col("{{qfr_in_year}}").add_child([
      {
        type: "big_int",
        nick: "thisyearauthorities",
        header: {
          en: "Total available for use for the year ending {{qfr_in_year_end}}",
          fr:
            "Crédits totaux disponibles pour l'exercice se terminant le {{qfr_in_year_end}}",
        },
        description: {
          en:
            "Corresponds to the authorities provided by Parliament, including transfers from other organizations, central votes, or adjustments available for use at quarter end. This value only includes authorities available for use and granted by Parliament at quarter end.",
          fr:
            "Correspondent aux autorisations accordées par le Parlement, y compris les virements d'autres organisations, les crédits centraux ou les rajustements disponibles pour emploi à la fin du trimestre. Ceci ne comprend que les autorisations disponibles et octroyées par le Parlement à la fin du trimestre.",
        },
      },
      {
        type: "big_int",
        nick: "thisyear_quarterexpenditures",
        header: {
          en:
            "Used during the quarter ended {{qfr_month_name}}, {{qfr_in_year_short_first}}",
          fr:
            "Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{qfr_in_year_short_first}}",
        },
        description: {
          en:
            "Reflects expenditures against authorities available for the selected quarter.",
          fr:
            "Correspondent aux dépenses faites à partir des autorisations disponibles pour le trimestre sélectionné.",
        },
      },
      {
        type: "big_int",
        initial_visible: true,
        nick: "thisyearexpenditures",
        header: {
          en: "Year to date used at quarter-end",
          fr: "Cumul des crédits utilisés à la fin du trimestre",
        },
        description: {
          en:
            "Represents cumulative spending by the organization during the fiscal year up to the end of the selected quarter.",
          fr:
            "Représente les dépenses cumulatives de l’organisation du début de l’exercice financier jusqu'à la fin du trimestre sélectionné.",
        },
      },
    ]);
    this.add_col("{{qfr_last_year}}").add_child([
      {
        type: "big_int",
        nick: "lastyearauthorities",
        header: {
          en:
            "Total available for use for the year ending {{qfr_last_year_end}}",
          fr:
            "Crédits totaux disponibles pour l'exercice se terminant le {{qfr_last_year_end}}",
        },
        description: {
          en:
            "Corresponds to the authorities provided by Parliament, including transfers from other organizations, central votes, or adjustments available for use at quarter end. This value only includes authorities available for use and granted by Parliament at quarter end.",
          fr:
            "Correspondent aux autorisations accordées par le Parlement, y compris les virements d'autres organisations, les crédits centraux ou les rajustements disponibles pour emploi à la fin du trimestre. Ceci ne comprend que les autorisations disponibles et octroyées par le Parlement à la fin du trimestre.",
        },
      },
      {
        type: "big_int",
        nick: "lastyear_quarterexpenditures",
        header: {
          en:
            "Used during the quarter ended {{qfr_month_name}}, {{qfr_last_year_short_first}} ",
          fr:
            "Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short_first}}",
        },
        description: {
          en:
            "Reflects expenditures gainst authorities available for the selected quarter.",
          fr:
            "Correspondent aux dépenses faites à partir des autorisations disponibles pour le trimestre sélectionné.",
        },
      },
      {
        type: "big_int",
        nick: "lastyearexpenditures",
        header: {
          en: "Year to date used at quarter-end",
          fr: "Cumul des crédits utilisés à la fin du trimestre",
        },
        description: {
          en:
            "Represents cumulative spending by the organization during the fiscal year up to the end of the selected quarter.",
          fr:
            "Représente les dépenses cumulatives de l’organisation du début de l’exercice financier jusqu'à la fin du trimestre sélectionné.",
        },
      },
    ]);
  },

  queries: {
    auth_change: function (format) {
      // returns last year, this year, and change
      var this_year = "thisyearauthorities",
        last_year = "lastyearauthorities",
        total = this.sum([this_year, last_year]),
        change = total[this_year] / total[last_year] - 1,
        data = [total[this_year], total[last_year], change];
      if (!format) {
        return data;
      }
      return FORMAT.list_formatter(["big_int", "big_int", "percentage"], data);
    },
    exp_change: function (format) {
      // returns last year, this year, and change
      var this_year = "thisyearexpenditures",
        last_year = "lastyearexpenditures",
        total = this.sum([this_year, last_year]),
        change = total[this_year] / total[last_year] - 1,
        data = [total[this_year], total[last_year], change];
      if (!format) {
        return data;
      }
      return FORMAT.list_formatter(["big_int", "big_int", "percentage"], data);
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

  sort: function (mapped_rows) {
    var grps = _.groupBy(mapped_rows, function (row) {
      return _.isNumber(row[0]);
    });
    if (_.has(grps, true)) {
      grps[true] = _.sortBy(grps[true], function (row) {
        return row[0];
      });
    } else {
      grps[true] = [];
    }
    if (_.has(grps, false)) {
      grps[false] = _.sortBy(grps[false], function (row) {
        return row[1];
      });
    } else {
      grps[false] = [];
    }
    return grps[true].concat(grps[false]);
  },

  mapper: function (row) {
    if (this.lang === "en") {
      row.splice(4, 1);
    } else {
      row.splice(3, 1);
    }

    return row;
  },
};
