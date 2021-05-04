import { sum } from "d3-array";
import { nest } from "d3-collection";
import _ from "lodash";

import { businessConstants } from "src/models/businessConstants.ts";

import { Subject } from "src/models/subject.js";
import { trivial_text_maker, run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import * as format from "src/core/format.js";

const m = run_template;
const text_maker = trivial_text_maker;

const vote_stat_dimension = (options) => (d) =>
  trivial_text_maker(parseInt(d.votenum) ? "voted" : "stat");
const sobj_dimension = (options) => (row) => row.sobj_name;
const lapse_item_dimension = (options) => (row) => row.lapse_item;

function major_vote_stat(options) {
  var by_type_and_desc = nest()
    .key(function (d) {
      return d.votestattype;
    })
    .key(function (d) {
      return d.desc;
    })
    .object(options.table.data);

  var interesting_stats = _.chain(by_type_and_desc["999"])
    .toPairs()
    .filter(function (key_grp) {
      return key_grp[1].length > 6;
    })
    .map(function (key_grp) {
      return key_grp[0];
    })
    .value();

  var sort_map = _.chain(by_type_and_desc)
    .toPairs()
    .map(function (key_grp) {
      return [trivial_text_maker("vstype" + key_grp[0]), +key_grp[0]];
    })
    .fromPairs()
    .value();

  options.table.horizontal_group_sort = function (group) {
    return +sort_map[group] || 998;
  };
  return function (row) {
    if (row.votestattype === 999) {
      if (_.includes(interesting_stats, row.desc)) {
        return "(S) " + row.desc;
      }
    }
    if (row.votestattype) {
      return trivial_text_maker("vstype" + row.votestattype);
    }
  };
}

const major_vote_big_stat = (col_to_sum) => (options) => {
  var by_type_and_desc = nest()
    .key(function (d) {
      return d.votestattype;
    })
    .key(function (d) {
      return d.desc;
    })
    .object(options.table.data);

  var interesting_stats = _.chain(by_type_and_desc["999"])
    .toPairs()
    .filter(([key, group]) => {
      const group_size = group.length;
      const group_total = _.sumBy(group, col_to_sum);
      return (
        (group_size > 30 && group_total > 30000000) || //must be a group of at least and have at least 30 million
        group_total > 5000000000 //interesting stat items to have minimum 5 billion
      );
    })
    .map(function (key_grp) {
      return key_grp[0];
    })
    .value();

  var sort_map = _.chain(by_type_and_desc)
    .toPairs()
    .map(function (key_grp) {
      return [trivial_text_maker("vstype" + key_grp[0]), +key_grp[0]];
    })
    .fromPairs()
    .value();

  options.table.horizontal_group_sort = function (group) {
    return +sort_map[group] || 998;
  };
  return function (row) {
    if (row.votestattype === 999) {
      if (_.includes(interesting_stats, row.desc)) {
        return "(S) " + row.desc;
      }
    }
    if (row.votestattype) {
      return trivial_text_maker("vstype" + row.votestattype);
    }
  };
};

function hist_major_vote_stat(options) {
  return function (row) {
    if (row.votestattype) {
      return (
        row.fyear + " - " + trivial_text_maker("vstype" + row.votestattype)
      );
    }
  };
}

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

const is_revenue = (so_num) => +so_num > 19;
const last_year_col = "{{pa_last_year}}";

const sum_last_year_exp = (rows) =>
  _.chain(rows)
    .map((row) => row[last_year_col])
    .filter(_.isNumber)
    .reduce((acc, item) => acc + item, 0)
    .value();

//given rows of std-obj-expenditure rows,  sums it up to return gross expenditures, net expenditures and revenue
const rows_to_rev_split = (rows) => {
  const [neg_exp, gross_exp] = _.chain(rows)
    .filter((x) => x) //TODO remove this
    .partition((row) => is_revenue(row.so_num))
    .map(sum_last_year_exp)
    .value();
  const net_exp = gross_exp + neg_exp;
  if (neg_exp === 0) {
    return false;
  }
  return { neg_exp, gross_exp, net_exp };
};

const collapse_by_so = function (programs, table, filter) {
  // common calculation for organizing program/so row data by so
  // and summing up all the programs for the last year of spending
  // then sorting by largest to smallest

  return _.chain(programs)
    .map((prog) => table.programs.get(prog))
    .compact()
    .flatten()
    .compact()
    .groupBy("so")
    .toPairs()
    .map((key_value) => ({
      label: key_value[0],
      so_num: key_value[1][0].so_num,
      value: sum(key_value[1], (d) => d["{{pa_last_year}}"]),
    }))
    .filter(filter || (() => true))
    .sortBy((d) => -d.value)
    .value();
};

const is_non_revenue = (d) => +d.so_num < 19;

export {
  vote_stat_dimension,
  sobj_dimension,
  lapse_item_dimension,
  major_vote_stat,
  major_vote_big_stat,
  hist_major_vote_stat,
  people_five_year_percentage_formula,
  trivial_text_maker,
  text_maker,
  businessConstants,
  run_template,
  m,
  Subject,
  format,
  year_templates,
  rows_to_rev_split,
  is_non_revenue,
  collapse_by_so,
};
