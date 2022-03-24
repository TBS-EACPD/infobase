import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { DataSets } from "src/models/metadata/DataSets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import { people_five_year_percentage_formula } from "./people_five_year_percentage_formula";

import text from "./orgEmployeeRegion.yaml";

const { provinces } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  id: "orgEmployeeRegion",
  legacy_id: "table10",
  data_set: DataSets.employee_region,
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
      type: "short-str",
      key: true,
      hidden: true,
      not_for_display: true,
      nick: "region_code",
      header: "",
    });
    this.add_col({
      key: true,
      type: "short-str",
      nick: "region",
      header: {
        en: "Geographic Region",
        fr: "Région géographique",
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
            "Corresponds to the active employee population by Geographic Region, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond au personnel actif par région géographique, au 31 mars " +
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
      formula: people_five_year_percentage_formula("region", people_years),
      is_summable: false,
    });
  },

  mapper: function (row) {
    var new_value = provinces[row[1]].text;
    row.splice(2, 0, new_value);
    return row;
  },

  sort: function (mapped_rows) {
    return _.sortBy(mapped_rows, function (row) {
      if (row.region === provinces.abroad.text) {
        return "Z";
      }
      if (row.region[0] === "Î") {
        return "I";
      }
      return row.region;
    });
  },
};
