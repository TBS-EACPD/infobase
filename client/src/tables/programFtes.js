import _ from "lodash";

import d3 from "src/app_bootstrap/d3-bundle.js";

import { Subject, trivial_text_maker, m, year_templates } from "./table_common";

import text from "./programFtes.yaml";

// see [here](../table_definition.html) for description
// of the table spec
//
const { std_years, planning_years } = year_templates;
const { Program } = Subject;

export default {
  text,
  id: "programFtes",
  legacy_id: "table12",
  subject_type: "program",
  source: ["DP", "DRR"],
  //"tags" : ["results", "expenditures", "FTE", "planning","report","RPP"],
  tags: ["GOCO", "PA", "FTE", "PROG", "ANNUAL", "PLANNED_EXP", "DP", "DRR"],

  name: {
    en: "Full-Time Equivalents (FTEs) by Program",
    fr: "Équivalents temps plein (ETP) par programme",
  },

  title: {
    en:
      "Actual and Planned Full-Time Equivalents (FTEs) by Program from {{pa_last_year_5}} to {{planning_year_3}}",
    fr:
      "Équivalents temps plein (ETP) actuels et prévus par programme de {{pa_last_year_5}} à {{planning_year_3}}",
  },

  "footnote-topics": {
    group: ["planned_spending"],
    table: ["~planned_spending", "planned_spending_gov"],
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
      hidden: true,
      type: "str",
      nick: "activity_code",
      header: "",
    });
    this.add_col({
      key: true,
      hidden: true,
      type: "str",
      nick: "program_id",
      header: "",
    });
    this.add_col({
      key: true,
      type: "wide-str",
      nick: "prgm",
      header: {
        en: "Program",
        fr: "Programme",
      },
    });
    _.each(std_years, (header, ix) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: {
          en: header + "  " + m("Actual FTEs"),
          fr: header + "  " + m("ETP réel"),
        },
        description: {
          en: `Corresponds to the total number of actual FTEs for the fiscal year ${header}`,
          fr: `Correspond au nombre total d'équivalents temps plein (ETP) réel pour l'exercice ${header}`,
        },
      });
    });

    this.add_col({
      type: "big_int",
      nick: "pa_last_year_planned",
      /* TODO hidden needs to be manually toggled off when DPs are tabled,
              hidden needs to be manually toggled on when DRRs are tabled.
      */
      hidden: true,
      header: {
        en: "{{pa_last_year_planned}} - " + m("Planned FTEs"),
        fr: "{{pa_last_year_planned}} - " + m("ETP prévus"),
      },
      description: {
        en: `Corresponds to the total number of planned FTEs for the fiscal year {{pa_last_year_planned}}`,
        fr: `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice {{pa_last_year_planned}}`,
      },
    });
    _.each(planning_years, (header) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: {
          en: header + "  " + m("Planned FTEs"),
          fr: header + "  " + m("ETP prévus"),
        },
        description: {
          en: `Corresponds to the total number of planned FTEs for the fiscal year ${header}`,
          fr: `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice ${header}`,
        },
      });
    });
  },

  dimensions: [
    {
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function (options) {
        var func = function (row) {
          const prog = Program.lookup(
            Program.unique_id(row.dept, row.activity_code)
          );
          //FIXME: this is because I found a program without a goco,
          const goco = _.get(prog, "tags_by_scheme.GOCO[0].name");
          return goco || trivial_text_maker("unknown");
        };
        return func;
      },
    },
    {
      title_key: "gov_goco",
      include_in_report_builder: true,

      filter_func: function (options) {
        var func = function (row) {
          const prog = Program.lookup(
            Program.unique_id(row.dept, row.activity_code)
          );
          //FIXME: this is because I found a program without a goco,
          const sa = _.get(prog, "tags_by_scheme.GOCO[0].parent_tag.name");
          return sa || trivial_text_maker("unknown");
        };
        return func;
      },
    },
    {
      title_key: "goco_id",
      filter_func: function (options) {
        var func = function (row) {
          const prog = Program.lookup(
            Program.unique_id(row.dept, row.activity_code)
          );
          const goco = _.first(prog.tags_by_scheme.GOCO);
          return goco && goco.id;
        };
        return func;
      },
    },
  ],

  sort: function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) {
      return [row.goco_gov, row.goco];
    });
  },

  mapper: function (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);

    row.splice(2, 0, program.id);
    row.splice(3, 0, program.name);
    return row;
  },

  process_mapped_row(mapped_row) {
    const program_obj = Program.get_from_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs.
  },

  queries: {
    sorted_programs: function (yrs) {
      return _.chain(this.data)
        .map(function (d) {
          return [d.prgm].concat(
            _.map(yrs, function (x) {
              return d[x];
            })
          );
        })
        .sortBy(function (x) {
          return -d3.sum(_.tail(x));
        })
        .value();
    },
  },
};
