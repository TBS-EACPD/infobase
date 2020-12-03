import d3 from "src/app_bootstrap/d3-bundle.js";

import {
  trivial_text_maker,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeGender.yaml";

const { gender } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeGender",
  legacy_id: "table302",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "SUPPRESSED_DATA", "GENDER", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/ae34a065-99b9-4e04-90f7-8d29afafc886",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/ae34a065-99b9-4e04-90f7-8d29afafc886",
  },

  name: {
    en: "Employee Gender",
    fr: "Sexe des employés",
  },

  title: {
    en: "Employee Gender",
    fr: "Sexe des employés",
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
      nick: "gender",
      header: trivial_text_maker("employee_gender"),
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
            "Corresponds to the active employee population by Gender, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond au personnel actif par sexe, au 31 mars " +
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
      formula: people_five_year_percentage_formula("gender", people_years),
    });
  },

  queries: {
    gov_grouping: function () {
      return _.chain(this.table.horizontal(people_years, false))
        .map(function (people_years, key) {
          return [key].concat(people_years);
        })
        .sortBy(function (row) {
          return d3.sum(_.tail(row));
        })
        .value();
    },
  },

  dimensions: [
    {
      title_key: "horizontal",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.gender;
        };
      },
    },
  ],

  mapper: function (row) {
    var new_value = gender[row[1]].text;
    row.splice(1, 1, new_value);
    return row;
  },
};
