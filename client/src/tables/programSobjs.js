import _ from "lodash";

import { Program } from "src/models/subjects";

import { year_templates, businessConstants } from "./table_common";

import text from "./programSobjs.yaml";

const { sos } = businessConstants;

const { std_years } = year_templates;

export default {
  text,
  id: "programSobjs",
  legacy_id: "table305",
  subject_type: "program",
  source: ["CFMRS"],
  tags: ["PA", "SOBJ", "EXP", "PROG", "ANNUAL", "GOCO"],
  name: {
    en: "Program Expenditures by Standard Object",
    fr: "Dépenses de programmes par article courant",
  },
  title: {
    en: "Program Expenditures by Standard Object {{pa_last_year}} ($)",
    fr: "Dépenses de programmes par article courant {{pa_last_year}} (en dollars)",
  },
  add_cols() {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
    });
    this.add_col({
      type: "string",
      key: true,
      hidden: true,
      nick: "activity_code",
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
    this.add_col({
      key: true,
      type: "int",
      hidden: true,
      nick: "so_num",
    });
    this.add_col({
      key: true,
      type: "str",
      nick: "so",
      header: {
        en: "Standard Object",
        fr: "Article courant",
      },
    });
    std_years.forEach((yr) => {
      this.add_col({
        type: "dollar",
        nick: yr,
        header: yr,
        description: {
          en:
            "Corresponds to the funds spent by standard object during the fiscal year " +
            yr,
          fr:
            "Correspond aux dépenses effectuées par article courant durant l'exercice financier " +
            yr,
        },
      });
    });
  },
  sort(rows, lang) {
    return _.sortBy(rows, (row) => row.so_num);
  },
  mapper(row) {
    const program = Program.lookup_by_dept_id_and_activity_code(row[0], row[1]);

    row.splice(2, 0, program.name);
    row.splice(4, 0, sos[row[3]].text);

    return row;
  },
  process_mapped_row(mapped_row) {
    const program_obj = Program.lookup_by_dept_id_and_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );
    if (!this.programs.get(program_obj)) {
      this.programs.set(program_obj, []);
    }
    this.programs.get(program_obj).push(mapped_row);
  },
  dimensions: ["dept", "prgm", "so"],
};
