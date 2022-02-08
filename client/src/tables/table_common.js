import { sum } from "d3-array";
import _ from "lodash";

function people_five_year_percentage_formula(
  col_name,
  col_names_to_be_averaged
) {
  return function (table, row) {
    // scenarios accommodated
    // 1 - all rows in the table
    //       return 1
    // 2 - all rows for a particular col_name value
    //       for the denominator, ensure you sum up the total employees for all orgs in the table
    // 3 - all col_names for selected departments
    //       for the denominator, ensure you sum up the total employees for just the requested orgs
    // 4 - one col_name for selected departments
    //       for the denominator, ensure you sum up the total employees for just the requested orgs
    // 5 - one row from the table, passed in as either a row
    //     object or a row object inside an array of length 1
    //
    var calculated; // the returned value
    var cat_totals = [];
    var total_totals = [];
    var row_orgs;
    var cats;
    var mono_cat;
    var all_cat_lines;
    var row_sum;
    // row can be one row or an array of rows
    if (row.length === table.data.length) {
      // scenario 1
      return 1;
    } else if (_.isArray(row) && row.length > 1) {
      // scenarios 2,3,4
      row_orgs = _.chain(row).map("dept").uniqBy().invert().value();
      cats = _.chain(row).map(col_name).uniqBy().value();
      mono_cat = cats.length === 1;
      if (mono_cat) {
        // all_cat_lines === true means scenario 2
        all_cat_lines =
          _.filter(table.data, function (d) {
            return d[col_name] === cats[0];
          }).length === row.length;
      }
      _.each(col_names_to_be_averaged, function (year, i) {
        _.each(table.data, function (d) {
          // scenario 2
          if (all_cat_lines) {
            total_totals[i] = total_totals[i] + d[year] || d[year];
          } else if (!_.isUndefined(row_orgs[d.dept])) {
            // scenario 3 or 4
            total_totals[i] = total_totals[i] + d[year] || d[year];
          }
        });
        row_sum = sum(row, function (d) {
          return d[year];
        });
        cat_totals[i] = cat_totals[i] + row_sum || row_sum;
      });
      // now divide the category totals by the total totals
      // and produce the average
      calculated = sum(cat_totals) / sum(total_totals);
    } else if (_.isArray(row) && row.length === 1) {
      // scenario 5
      calculated = row[0].five_year_percent;
    } else {
      // scenario 5
      calculated = row.five_year_percent;
    }

    if (calculated === 0) {
      // In the .csv files, five_year_percent columns are stored as 4-decimal fixed-length values. Values less than 0.0001 (ie. 0.01%) are rounded to 0. By the nature
      // of the values, there will never be five_year_percent values that are truly zero, these are just rounding/formatting errors!
      // Since the InfoBase only displays these percentages formated to 1 decimal anyway (ie. ##.#%), that's fine, BUT in cases such as the the zero_filter function used
      // in the rpb, this could lead to, ultimately, incorrectly calculated percentages (eg. gov total %'s summing to greater than 100).
      // Simply replacing instances of 0 with values << 0.001 will prevent this sort of thing from happening in the future, while not effecting what is displayed in the IB.
      return 0.000001;
    }

    return calculated;
  };
}

export { people_five_year_percentage_formula };
