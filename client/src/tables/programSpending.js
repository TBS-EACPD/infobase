import _ from "lodash";

import { Datasets } from "src/models/metadata/Datasets";
import { Program } from "src/models/subjects";
import { year_templates } from "src/models/years";

import text from "./programSpending.yaml";

const { std_years, planning_years } = year_templates;

export default {
  id: "programSpending",
  legacy_id: "table6",
  data_set: Datasets.program_spending,
  text,

  subject_type: "program",

  add_cols: function () {
    this.add_col({ nick: "preamble", header: "" }).add_child([
      {
        type: "int",
        key: true,
        hidden: true,
        nick: "dept",
        header: "",
        can_group_by: true,
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
        can_group_by: true,
      },
    ]);
    _.each(std_years, (header) => {
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
          type: "dollar",
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
      ]);
    });
  },

  sort: function (mapped_rows) {
    return _.sortBy(mapped_rows, function (row) {
      return row.prgm;
    });
  },

  mapper: function (row) {
    const program = Program.lookup_by_dept_id_and_activity_code(row[0], row[1]);

    row.splice(2, 0, program.id);
    row.splice(3, 0, program.name);
    return row;
  },

  process_mapped_row: function (mapped_row) {
    const program_obj = Program.lookup_by_dept_id_and_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs.
  },
};
