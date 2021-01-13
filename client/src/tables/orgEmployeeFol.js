import _ from "lodash";

import d3 from "src/core/d3-bundle.js";

import {
  trivial_text_maker,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeFol.yaml";

const { fol } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeFol",
  legacy_id: "table303",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "SUPPRESSED_DATA", "FOL", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/9582d4b0-4ba2-4a0f-9c5f-70c192567208",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/9582d4b0-4ba2-4a0f-9c5f-70c192567208",
  },

  name: {
    en: "First Official Language",
    fr: "Première langue officielle",
  },

  title: {
    en: "First Official Language",
    fr: "Première langue officielle",
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
      nick: "fol",
      header: trivial_text_maker("FOL"),
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
            "Corresponds to the active employee population by First Official Language, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond à le personnel actif par première langue officielle, au 31 mars " +
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
      formula: people_five_year_percentage_formula("fol", people_years),
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

  mapper: function (row) {
    row.splice(1, 1, fol[row[1]].text);
    return row;
  },

  dimensions: [
    {
      title_key: "horizontal",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.fol;
        };
      },
    },
  ],
};
