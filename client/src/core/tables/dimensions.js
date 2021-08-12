import _ from "lodash";

import { Subject } from "src/models/subject";

import { text_maker } from "src/tables/table_common";

const { Gov } = Subject;

export function get_dimensions(table) {
  const columns = _.chain(table._cols)
    .map((col) => (_.has(col, "children") ? col.children : col))
    .flatten()
    .value();
  const can_group_vs = _.some(columns, (col) => _.has(col, "can_group_vs"));
  table.dimensions = _.chain(columns)
    .filter("can_group_by")
    .map((col) => col.nick)
    .concat(can_group_vs ? "vote_vs_stat" : "")
    .compact()
    .value();

  table.dimensions.unshift("all");
}

// TODO: come up with a shorter, better name for this sum_col_by_grouped_data
export function get_sum_col_by_grouped_data_func(table) {
  table.sum_col_by_grouped_data = function (col, dimension, subject = Gov) {
    const { group_by_vs_func, data } = table;
    const dim_vote_stat = dimension === "vote_vs_stat";

    return _.chain(data)
      .filter((row) => filter_row_by_subj(row, subject))
      .groupBy(
        dim_vote_stat ? (row) => group_by_vs_func(dimension, row) : dimension
      )
      .map((data_group) => {
        const dim_name = dim_vote_stat
          ? group_by_vs_func("vote_vs_stat", data_group[0])
            ? text_maker("stat")
            : text_maker("voted")
          : data_group[0][dimension];
        const summed_col = _.isArray(col)
          ? _.chain(col)
              .map((c) => _.sumBy(data_group, c))
              .value()
          : _.sumBy(data_group, col);
        return [dim_name, summed_col];
      })
      .fromPairs()
      .value();
  };
}

export function filter_row_by_subj(row, subject) {
  switch (subject.level) {
    case "gov": {
      return _.identity(row);
    }
    case "dept": {
      return row.dept === subject.id;
    }
    case "prgm": {
      return row.program_id === subject.id;
    }
  }
}
