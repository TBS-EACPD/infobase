import _ from "lodash";

import { Program } from "src/models/subjects";

import { run_template } from "src/models/text";

import { year_templates } from "src/models/years";

import text from "./programFtes.yaml";

const { std_years, planning_years } = year_templates;

export default {
  text,
  id: "programFtes",
  legacy_id: "table12",
  subject_type: "program",
  source: ["DP", "DRR"],
  tags: ["GOCO", "PA", "FTE", "PROG", "ANNUAL", "PLANNED_EXP", "DP", "DRR"],

  name: {
    en: "Full-Time Equivalents (FTEs) by Program",
    fr: "Équivalents temps plein (ETP) par programme",
  },

  title: {
    en: "Actual and Planned Full-Time Equivalents (FTEs) by Program from {{pa_last_year_5}} to {{planning_year_3}}",
    fr: "Équivalents temps plein (ETP) actuels et prévus par programme de {{pa_last_year_5}} à {{planning_year_3}}",
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
      can_group_by: true,
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
      can_group_by: true,
    });
    _.each(std_years, (header) => {
      this.add_col({
        type: "decimal2",
        nick: header,
        header: {
          en: header + "  " + run_template("Actual FTEs"),
          fr: header + "  " + run_template("ETP réel"),
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
        en: "{{pa_last_year_planned}} - " + run_template("Planned FTEs"),
        fr: "{{pa_last_year_planned}} - " + run_template("ETP prévus"),
      },
      description: {
        en: `Corresponds to the total number of planned FTEs for the fiscal year {{pa_last_year_planned}}`,
        fr: `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice {{pa_last_year_planned}}`,
      },
    });
    _.each(planning_years, (header) => {
      this.add_col({
        type: "decimal2",
        nick: header,
        header: {
          en: header + "  " + run_template("Planned FTEs"),
          fr: header + "  " + run_template("ETP prévus"),
        },
        description: {
          en: `Corresponds to the total number of planned FTEs for the fiscal year ${header}`,
          fr: `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice ${header}`,
        },
      });
    });
  },

  sort: function (mapped_rows) {
    return _.sortBy(mapped_rows, function (row) {
      return [row.goco_gov, row.goco];
    });
  },

  mapper: function (row) {
    const program = Program.lookup_by_dept_id_and_activity_code(row[0], row[1]);

    row.splice(2, 0, program.id);
    row.splice(3, 0, program.name);
    return row;
  },

  process_mapped_row(mapped_row) {
    const program_obj = Program.lookup_by_dept_id_and_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs.
  },
};
