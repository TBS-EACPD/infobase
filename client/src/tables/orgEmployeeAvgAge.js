import _ from "lodash";

import { DataSets } from "src/models/metadata/DataSets";
import { trivial_text_maker } from "src/models/text";
import { year_templates } from "src/models/years";

import text from "./orgEmployeeAvgAge.yaml";

const { people_years, people_years_short_second } = year_templates;

export default {
  id: "orgEmployeeAvgAge",
  legacy_id: "table304",
  data_set: DataSets.avg_age,
  text,

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
    });
    this.add_col({
      type: "wide-str",
      key: true,
      hidden: true,
      nick: "avgage",
      header: trivial_text_maker("avgage"),
    });
    _.each(people_years, (header, ix) => {
      this.add_col({
        type: "decimal1",
        nick: header,
        header: `${trivial_text_maker("fiscal_year_end")}, ${
          people_years_short_second[ix]
        }`,
        description: {
          en:
            "Corresponds to the departmental average age, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond à l'âge moyen au ministère, au 31 mars " +
            people_years_short_second[ix],
        },
        formula: function (table, row) {
          // Displays FPS total average as the total row in every case except when you have a single department selected; good enough
          // although it would be okay if it just always did, and even better if we could clarify that it is the total FPS weighted average in the text
          if (_.isArray(row)) {
            if (row.length === table.data.length) {
              return table.GOC[0][header];
            } else if (row.length === 1) {
              return row[0][header];
            } else {
              return table.GOC[0][header];
            }
          }
          return row[header];
        },
      });
    });
  },

  mapper: function (row) {
    row.splice(1, 1, trivial_text_maker("avgage"));
    return row;
  },
};
