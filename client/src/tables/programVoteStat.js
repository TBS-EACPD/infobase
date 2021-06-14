import _ from "lodash";

import { Subject, trivial_text_maker, year_templates } from "./table_common";

import text from "./programVoteStat.yaml";

const { Program } = Subject;

const { std_years } = year_templates;

export default {
  text,
  id: "programVoteStat",
  legacy_id: "table300",
  subject_type: "program",
  tags: ["PROG", "PA", "EXP", "VOTED", "STAT", "ANNUAL"],
  source: ["CFMRS"],
  name: {
    en: "Program Expenditures by Authority Type",
    fr: "Dépenses de programme par type d'autorisation",
  },
  title: {
    en: "Program Expenditures by Authority Type {{pa_last_year}} ($)",
    fr: "Dépenses de programme par type d'autorisation {{last_year}} (en dollars)",
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
      type: "int",
      hidden: true,
      nick: "activity_code",
      header: "",
    });
    this.add_col({
      key: true,
      type: "str",
      nick: "prgm",
      header: {
        en: "Program",
        fr: "Program",
      },
    });
    this.add_col({
      key: true,
      type: "str",
      nick: "vote_stat",
      header: {
        en: "Voted / Stat",
        fr: "Crédit / législatif",
      },
    });
    std_years.forEach((yr) => {
      this.add_col({
        type: "dollar",
        nick: yr,
        header: yr,
        description: {
          en:
            "Corresponds to the funds spent against authorities available for the fiscal year " +
            yr,
          fr:
            "Correspond aux dépenses effectuées par rapport aux autorisations disponibles durant l'exercice financier " +
            yr,
        },
      });
    });
  },
  sort: function (rows, lang) {
    return _.sortBy(rows, function (row) {
      return row.so_num;
    });
  },
  mapper: function (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);

    row.splice(2, 0, program.name);
    row[3] =
      row[3] === "V" ? trivial_text_maker("voted") : trivial_text_maker("stat");
    return row;
  },
  process_mapped_row(mapped_row) {
    const program_obj = Program.get_from_activity_code(
      mapped_row.dept,
      mapped_row.activity_code
    );

    if (!this.programs.get(program_obj)) {
      this.programs.set(program_obj, []);
    }
    this.programs.get(program_obj).push(mapped_row);
  },
  dimensions: [
    {
      title_key: "voted_stat",
      include_in_report_builder: true,
      filter_func: () => _.property("vote_stat"),
    },
    {
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function (options) {
        var func = function (row) {
          const prog = Program.lookup(
            Program.unique_id(row.dept, row.activity_code)
          );
          const goco = prog.tags_by_scheme.GOCO && prog.tags_by_scheme.GOCO[0];
          return (goco && goco.name) || trivial_text_maker("unknown");
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

          const goco = prog.tags_by_scheme.GOCO && prog.tags_by_scheme.GOCO[0];
          return (
            (goco && goco.parent_tag.name) || trivial_text_maker("unknown")
          );
        };
        return func;
      },
    },
  ],
};
