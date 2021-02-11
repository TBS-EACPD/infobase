import { sum } from "d3-array";
import _ from "lodash";

import {
  trivial_text_maker,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeExLvl.yaml";

const { compact_ex_level_map, ex_levels } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeExLvl",
  legacy_id: "table112",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "EX_LVL", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/2e4e5626-3185-4c8d-932a-7e161355fb96",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/2e4e5626-3185-4c8d-932a-7e161355fb96",
  },

  name: {
    en: "Executive Level",
    fr: "Niveaux des cadres supérieurs",
  },

  title: {
    en: "Executive Level",
    fr: "Niveaux des cadres supérieurs",
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
      type: "int",
      key: true,
      nick: "ex_lvl",
      header: trivial_text_maker("ex_level"),
    });
    _.each(people_years, (header, ix) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: `${trivial_text_maker("fiscal_year_end")}, ${
          people_years_short_second[ix]
        }`,
        description: {
          en:
            "Corresponds to the active employee population by Executive Level, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond au personnel actif par direction niveaux, au 31 mars " +
            people_years_short_second[ix],
        },
      });
    });
    this.add_col({
      type: "percentage1",
      nick: "five_year_percent",
      header: trivial_text_maker("five_year_percent_header"),
      description: {
        en: trivial_text_maker("five_year_percent_description"),
        fr: trivial_text_maker("five_year_percent_description"),
      },
      formula: people_five_year_percentage_formula("ex_lvl", people_years),
      is_summable: false,
    });
  },

  mapper: function (row) {
    row.splice(1, 1, ex_levels[row[1]].text);
    return row;
  },

  dimensions: [
    {
      title_key: "horizontal",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.ex_lvl;
        };
      },
    },
    {
      title_key: "ex_level_condensed",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return compact_ex_level_map[row.ex_lvl];
        };
      },
    },
  ],

  queries: {
    gov_grouping: function () {
      return _.chain(this.table.horizontal(people_years, false))
        .map(function (years, key) {
          return [key].concat(years);
        })
        .sortBy(function (row) {
          return sum(_.tail(row));
        })
        .value();
    },
    summed_levels: function () {
      return _.groupBy(this.data, function (x) {
        return compact_ex_level_map[x.ex_lvl];
      });
    },
  },
};
