import { sum } from "d3-array";
import _ from "lodash";

import {
  trivial_text_maker,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeAgeGroup.yaml";

const { age_groups } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeAgeGroup",
  legacy_id: "table11",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "AGE", "ANNUAL", "SUPPRESSED_DATA"],

  link: {
    en: "http://open.canada.ca/data/en/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
    fr: "http://ouvert.canada.ca/data/fr/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
  },

  name: {
    en: "Employee Age Group",
    fr: "Groupe d’âge",
  },

  title: {
    en: "Employee Age Group",
    fr: "Groupe d’âge",
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
      nick: "age",
      header: {
        en: "Age Group",
        fr: "Groupe d’âge",
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
            "Corresponds to the active employee population by Age Group, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond à le personnel actif par groupe d'âge, au 31 mars " +
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
      formula: people_five_year_percentage_formula("age", people_years),
      is_summable: false,
    });
  },

  mapper: function (row) {
    row.splice(1, 1, age_groups[row[1]].text);
    return row;
  },

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
  },

  dimensions: [
    {
      title_key: "horizontal",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return row.age;
        };
      },
    },
  ],

  sort: function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) {
      var split = row.age.replace(/>|</, "").split("-");
      if (split.length === 2) {
        return +split[1];
      } else {
        split = row.age.split(" ");
        return +split[1] || +split[0];
      }
    });
  },
};
