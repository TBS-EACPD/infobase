import { sum } from "d3-array";
import _ from "lodash";

import {
  trivial_text_maker,
  format,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeAgeGroup.yaml";

const { formats } = format;
const { age_groups, compact_age_groups, emp_age_map } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeAgeGroup",
  legacy_id: "table11",
  source: ["RPS"],
  tags: ["PEOPLE", "FPS", "AGE", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
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
    high_level_age_split: function () {
      // breakdown the data into 4 individual groups, each of which will need to have it's
      // own seavgperate total calculated
      return _.groupBy(this.data, function (x) {
        return emp_age_map[x.age];
      });
    },
    high_level_rows: function () {
      var groups = this.high_level_age_split();
      return _.map(compact_age_groups, function (age_group) {
        var summed = _.map(people_years, function (year) {
          if (groups[age_group]) {
            return sum(groups[age_group], function (row) {
              return row[year];
            });
          } else {
            return 0;
          }
        });
        return [age_group].concat(summed);
      });
    },
    high_level_rows_with_percentage: function (year) {
      var fm1 = formats["big_int"];
      var fm2 = formats.percentage;
      var column = _.map(this.data, year);
      var dept_total = sum(column);
      var groups = this.high_level_age_split();
      // delete missing rows
      //delete groups[undefined]
      // use the keys you've alrady defined and iterate over them in the order
      // of your choice -- impose an order on the unordered groups objects
      var mapfunc = function (key) {
        var relevant_group = groups[key];
        var mini_column = _.map(relevant_group, year);
        var group_total = sum(mini_column);
        return [key, fm1(group_total), fm2(group_total / dept_total)];
      };
      return _.map(compact_age_groups, mapfunc);
    },
  },

  dimensions: [
    {
      title_key: "age_group_condensed",
      include_in_report_builder: true,

      filter_func: function (options) {
        return function (row) {
          return emp_age_map[row.age];
        };
      },
    },
    {
      title_key: "age_group",
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
