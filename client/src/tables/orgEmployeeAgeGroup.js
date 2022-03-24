import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { DataSets } from "src/models/metadata/DataSets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import { people_five_year_percentage_formula } from "./people_five_year_percentage_formula";

import text from "./orgEmployeeAgeGroup.yaml";

const { age_groups } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  data_set: DataSets.age_group,

  text,
  id: "orgEmployeeAgeGroup",
  legacy_id: "table11",
  tags: ["PEOPLE", "FPS", "AGE", "ANNUAL", "SUPPRESSED_DATA"],

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
      can_group_by: true,
    });
    this.add_col({
      key: true,
      type: "short-str",
      nick: "age",
      header: {
        en: "Age Group",
        fr: "Groupe d’âge",
      },
      can_group_by: true,
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

  sort: function (mapped_rows) {
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
