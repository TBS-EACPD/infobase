import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { Datasets } from "src/models/metadata/Datasets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import { people_five_year_percentage_formula } from "./people_five_year_percentage_formula";

import text from "./orgEmployeeGender.yaml";

const { gender } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  id: "orgEmployeeGender",
  legacy_id: "table302",
  data_set: Datasets.employee_gender,
  text,

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
      type: "int",
      nick: "gender",
      header: trivial_text_maker("employee_gender"),
      can_group_by: true,
    });
    _.forEach(people_years, (header, ix) => {
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
      is_summable: false,
    });
  },

  mapper: function (row) {
    var new_value = gender[row[1]].text;
    row.splice(1, 1, new_value);
    return row;
  },
};
