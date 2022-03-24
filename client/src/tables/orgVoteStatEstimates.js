import _ from "lodash";

import { estimates_docs } from "src/models/estimates";
import { DataSets } from "src/models/metadata/DataSets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import { lang } from "src/core/injected_build_constants";

import text from "./orgVoteStatEstimates.yaml";

const { estimates_years } = year_templates;

export default {
  id: "orgVoteStatEstimates",
  legacy_id: "table8",
  data_set: DataSets.tabled_estimates,
  text,

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
      can_group_by: true,
    });
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "votenum",
      header: {
        en: "Vote / Statutory Number",
        fr: "Crédit / Poste législatif Numéro",
      },
    });
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "votestattype",
      header: "",
    });
    this.add_col({
      type: "wide-str",
      key: true,
      nick: "desc",
      header: {
        en: "Vote / Statutory Description",
        fr: "Crédit / Poste législatif Description",
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
    });
    this.add_col({
      type: "wide-str",
      key: true,
      hidden: true,
      nick: "est_doc_code",
      header: {
        en: "Estimates",
        fr: "Budget des dépenses",
      },
    });
    this.add_col({
      type: "wide-str",
      key: true,
      nick: "est_doc",
      header: {
        en: "Estimates Instrument",
        fr: "Instrument des dépenses",
      },
      can_group_by: true,
    });
    _.each(estimates_years, (yr) => {
      this.add_col({
        type: "dollar",
        nick: yr + "_estimates",
        description: {
          en: "Tabled Amounts for " + yr,
          fr: "Montants déposés pour " + yr,
        },
        header: yr,
      });
    });
  },

  mapper: function (row) {
    row.splice(6, 0, estimates_docs[row[5]][lang]);

    if (this.lang === "en") {
      row.splice(4, 1);
    } else {
      row.splice(3, 1);
    }
    if (_.isNaN(+row[1])) {
      row[1] = "S";
      row[2] = 999;
    } else {
      row[3] = row[3] + " - " + row[1];
    }

    // remove acronym and vote type
    return row;
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
};
