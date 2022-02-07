import _ from "lodash";

import { Dept } from "src/models/subjects";

import { formats } from "src/core/format";
import { lang } from "src/core/injected_build_constants";

class Queries {
  constructor(table, data, subject) {
    this.table = table;
    this.lang = lang;
    this.dept = subject && subject.subject_type === "dept" && subject.id;
    this.subject = subject;
    this.data = data;
    _.extend(this, table.queries);
  }

  sort(func, reverse) {
    var sorter = func;
    reverse = reverse || false;
    // a string will be used to look up an attribute in each row
    if (_.isString(func)) {
      func = function (d) {
        return d[sorter];
      };
    }
    var sorted = _.sortBy(this.data, func);
    if (reverse) {
      sorted.reverse();
    }

    return sorted;
  }

  sum_cols(rows, cols) {
    // ar will be an array of

    var initial = _.map(cols, function () {
      return 0;
    });
    function reducer(x, y) {
      return _.map(x, function (__, i) {
        return x[i] + y[i];
      });
    }
    var total = _(rows)
      .map(function (row) {
        return _.map(cols, function (col) {
          return row[col];
        });
      })
      .reduce(reducer, initial);

    // deal with percentage columns
    _.each(cols, (col, i) => {
      // jump to [col_from_nick](base_tables.html#col_from_nick)
      var type = this.table.col_from_nick(col).type;
      if (type === "percentage") {
        total[i] = total[i] / total.length;
      }
    });
    return _.zipObject(cols, total);
  }

  sum(cols, options) {
    options = options || { include_defaults: false };
    var format = options.format || false;
    var as_object = options.as_object === undefined ? true : options.as_object;
    var data = this.data;
    if (_.isUndefined(cols)) {
      cols = this.default_cols;
    } else if (!_.isArray(cols)) {
      cols = [cols];
    }
    if (options.include_defaults) {
      cols = _.uniqBy(cols.concat(this.default_cols));
    }
    if (options.filter) {
      data = _.filter(data, options.filter);
    }
    var vals = this.sum_cols(data, cols);
    if (format) {
      _.each(cols, (col) => {
        // jump to [col_from_nick](base_tables.html#col_from_nick)
        var type = this.table.col_from_nick(col).type;
        vals[col] = _.get(formats, type, _.identity)(vals[col]);
      });
    }
    if (!as_object) {
      if (cols.length === 1) {
        return vals[cols[0]];
      } else {
        return _.map(cols, function (col) {
          return vals[col];
        });
      }
    }
    if (cols.length === 1) {
      return vals[cols[0]];
    } else {
      return vals;
    }
  }
}

function query_adapter(subject) {
  //normalize different arguments API
  if (Dept.store.has(subject)) {
    //patch old dept-id based API
    subject = Dept.store.lookup(subject);
  }
  // work around for new subject data structures
  if (subject && subject.subject_type === "gov") {
    subject = undefined;
  } else if (
    this.programs &&
    subject &&
    _.includes(["tag", "crso"], subject.subject_type)
  ) {
    const rows = _.chain(subject.programs)
      .map((program) => this.programs.get(program))
      .flatten()
      .compact()
      .value();
    return new Queries(this, rows, subject);
  } else if (this.programs && subject && subject.subject_type === "program") {
    const rows = this.programs.get(subject) || [];
    return new Queries(this, rows, subject);
  } else if (this.crs && "crso" === subject.subject_type) {
    const rows = this.crs.get(subject);
    return new Queries(this, rows, subject);
  }

  // if `subject` is defined
  if (!_.isUndefined(subject)) {
    if (subject && subject.id && this.depts[subject.id]) {
      // if the table has data on the requested department
      return new Queries(this, this.depts[subject.id], subject);
    } else {
      // otherwise return a query object for an empty array
      return new Queries(this, []);
    }
  }
  // subject is not defined, therefore, a query object
  // is created for all the data attached to this table
  return new Queries(this, this.data);
}

export { query_adapter };
