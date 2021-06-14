import _ from "lodash";

import { Subject, trivial_text_maker, year_templates } from "./table_common";

import text from "./programSpending.yaml";

// see [here](../table_definition.html) for description
// of the table spec
//const {spending_areas} = require('../../models/goco.js');

const { Program } = Subject;
const { std_years, planning_years } = year_templates;

export default {
  text,
  id: "programSpending",
  legacy_id: "table6",
  subject_type: "program",
  source: ["PA", "DP", "DRR"],
  tags: [
    "GOCO",
    "PLANNED_EXP",
    "PA",
    "EXP",
    "AUTH",
    "PROG",
    "ANNUAL",
    "DP",
    "DRR",
  ],

  name: { en: "Spending by Program", fr: "Dépenses de programmes" },

  title: {
    en: "Expenditures and Planned Spending by Program from {{pa_last_year_5}} to {{planning_year_3}} ($)",
    fr: "Dépenses réelles et prévues par programme de {{pa_last_year_5}} à {{planning_year_3}} (en dollars)",
  },

  add_cols: function () {
    this.add_col({ nick: "preamble", header: "" }).add_child([
      {
        type: "int",
        key: true,
        hidden: true,
        nick: "dept",
        header: "",
      },
      {
        key: true,
        hidden: true,
        type: "str",
        nick: "activity_code",
        header: "",
      },
      {
        key: true,
        hidden: true,
        type: "str",
        nick: "program_id",
        header: "",
      },
      {
        key: true,
        type: "wide-str",
        nick: "prgm",
        header: {
          en: "Program",
          fr: "Programme",
        },
      },
    ]);
    _.each(std_years, (header, ix) => {
      //TODO: the col definitions here are copied from orgVoteStatPa, either change them or make it DRY
      this.add_col(header).add_child([
        {
          type: "dollar",
          nick: `${header}exp`,
          header: {
            en: "Expenditures",
            fr: "Dépenses",
          },
          description: {
            en: `Corresponds to the funds spent against authorities available that year.`,
            fr: `Correspondent aux dépenses effectuées aux termes de autorisations disponibles cette année-là.`,
          },
        },
      ]);
    });
    this.add_col({
      type: "dollar",
      nick: "pa_last_year_planned",
      /* should be kept hidden!
       */
      hidden: true,
      header: {
        en: "{{pa_last_year_planned}} - Planned Spending",
        fr: "{{pa_last_year_planned}} - Dépenses prévues",
      },
      description: {
        en: `Corresponds to total planned spending for the fiscal year {{pa_last_year_planned}}, including additional funds approved by Treasury Board.`,
        fr: `Correspondent au total des dépenses prévues pour l'exercice {{pa_last_year_planned}}, y compris les fonds approuvés par le Conseil du Trésor.`,
      },
    });
    _.each(planning_years, (header) => {
      this.add_col(header).add_child([
        {
          type: "big_int",
          nick: header,
          header: {
            en: "Planned Spending",
            fr: "Dépenses prévues",
          },
          description: {
            en: `Corresponds to total planned spending for the fiscal year ${header}, including additional funds approved by Treasury Board.`,
            fr: `Correspondent au total des dépenses prévues pour l'exercice ${header}, y compris les fonds approuvés par le Conseil du Trésor.`,
          },
        },
        {
          type: "big_int",
          nick: `${header}_rev`,
          hidden: true,
        },
        {
          type: "big_int",
          nick: `${header}_spa`,
          hidden: true,
        },
        {
          type: "big_int",
          nick: `${header}_gross`,
          hidden: true,
        },
      ]);
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
          //FIXME: this is because I found a program without a goco,
          const prog = Program.lookup(
            Program.unique_id(row.dept, row.activity_code)
          );
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
      return row.prgm;
    });
  },

  mapper: function (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);

    row.splice(2, 0, program.id);
    row.splice(3, 0, program.name);
    return row;
  },

  process_mapped_row: function (mapped_row) {
    const program_obj = Program.get_from_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs.
  },

  queries: {
    sorted_programs: function () {
      return _.sortBy(this.data, function (x) {
        return -x[_.last(std_years) + "exp"];
      });
    },
  },
};
