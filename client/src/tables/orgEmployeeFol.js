import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { DataSets } from "src/models/metadata/DataSets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import { people_five_year_percentage_formula } from "./people_five_year_percentage_formula";

import text from "./orgEmployeeFol.yaml";

const { fol } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  id: "orgEmployeeFol",
  legacy_id: "table303",
  data_set: DataSets.employee_fol,
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
      nick: "fol",
      header: trivial_text_maker("FOL"),
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
      is_summable: false,
    });
  },

  mapper: function (row) {
    row.splice(1, 1, fol[row[1]].text);
    return row;
  },
};
