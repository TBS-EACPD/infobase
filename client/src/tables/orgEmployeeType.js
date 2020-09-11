import {
  trivial_text_maker,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeType.yaml";


const { tenure } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeType",
  legacy_id: "table9",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/13c5b5c5-5bbb-48b1-907a-dc7c5975345d",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/13c5b5c5-5bbb-48b1-907a-dc7c5975345d",
  },

  name: {
    en: "Employee Type",
    fr: "Type d’employé",
  },

  title: {
    en: "Employee Type",
    fr: "Type d’employé",
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
      type: "short-str",
      nick: "employee_type",
      header: {
        en: "Employee Type",
        fr: "Type d'employé",
      },
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
            "Corresponds to the active employee population by Employee Type, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond au personnel actif par type d'employé, au 31 mars " +
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
      formula: people_five_year_percentage_formula(
        "employee_type",
        people_years
      ),
    });
  },

  mapper: function (row) {
    row.splice(1, 1, tenure[row[1]].text);
    return row;
  },

  dimensions: [
    {
      title_key: "employee_type",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.employee_type;
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
          return d3.sum(_.tail(row));
        })
        .value();
    },
  },
};
