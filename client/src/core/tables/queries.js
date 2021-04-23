import _ from "lodash";

import { Subject } from "src/models/subject.js";

import * as FORMAT from "src/core/format.js";
import { lang } from "src/core/injected_build_constants.js";

// #Queries
// This module exists to  provides a common interface for querying
// the data associated with each table.
// [queries](#queries)  - provides a standardized data
//      access layer to do things like sum a certain column,
//      find a row from key values, etc..
//

//<div id='queries'></div>
// `queries` object is used
class Queries {
  constructor(table, data, subject) {
    this.table = table;
    this.lang = lang;
    this.dept = subject && subject.level === "dept" && subject.id;
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

  // <div id='sum'></div>
  //  ```javascript
  //    options = {
  //        include_defaults :
  //        as_object :
  //        format :
  //    }
  //  ```
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
        vals[col] = FORMAT.formatter(type, vals[col]);
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

  get_col(col, options) {
    options = options || {};
    options.pop_single = true;
    return this.get_cols(col, options);
  }

  // <div id='get_cols'></div>
  //  ```javascript
  //    options = {
  //        sorted :
  //        reverse :
  //        gross_percentage :
  //        format :
  //    }
  //  ```
  get_cols(cols, options) {
    options = options || {};
    let data, gp_colname;
    var sorted = options.sorted || false;
    var reverse = options.reverse || false;
    var gross_percentage = options.gross_percentage;
    var format = options.format;
    var sort_col = options.sort_col || cols[0];
    var filter = options.filter || false;

    if (!_.isArray(cols)) {
      cols = [cols];
    }

    if (sorted) {
      data = this.sort(sort_col, reverse);
    } else {
      data = this.data;
    }

    if (filter) {
      data = _.filter(data, filter);
    }

    let vals = _.chain(cols)
      .map((col) => [col, _.map(data, col)])
      .fromPairs()
      .value();

    if (gross_percentage) {
      gp_colname = gross_percentage + "gross_percentage";
      cols.push(gp_colname);
      vals[gp_colname] = [];
      var sum =
        _(vals[gross_percentage])
          .filter(function (val) {
            return val >= 0;
          })
          .reduce(function (x, y) {
            return x + y;
          }) + 1;
      _.each(vals[gross_percentage], function (val, i, list) {
        vals[gp_colname][i] = val / sum;
      });
    }
    if (format) {
      _.each(cols, (col) => {
        var type = this.table.col_from_nick(col).type;
        vals[col] = FORMAT.formatter(type, vals[col]);
      });
      if (gross_percentage) {
        vals[gp_colname] = FORMAT.formatter("percentage", vals[gp_colname]);
      }
    }
    if (options.pop_single && cols.length === 1) {
      return vals[cols[0]];
    }
    if (options.zip) {
      vals = _.zip.apply(
        null,
        _.map(cols, function (col) {
          return vals[col];
        })
      );
    }
    return vals;
  }

  // <div id='get_top_x'></div>
  get_top_x(cols, x, options) {
    // x is the number of rows requested
    // sorts by the first col
    options = options || {};
    _.extend(options, { sorted: true, reverse: true });
    // call ['this.get_cols'](#get_cols)
    var all_vals = this.get_cols(cols, options);
    if (options.zip) {
      all_vals = _.take(all_vals, x);
    } else {
      _.each(all_vals, function (list, key) {
        all_vals[key] = _.take(list, x);
      });
    }
    return all_vals;
  }

  get_row(criteria, options = {}) {
    //
    // * `col` : either a string or an array of strings for several columns
    // * `val` :
    // * `options` :
    //
    var each_mapped_obj = (obj) =>
      _.every(
        _.toPairs(criteria).map(([key, val]) => obj[key] === criteria[key])
      );
    return _.find(this.data, each_mapped_obj);
  }

  get_rows(criteria, options) {
    //
    // * `col` : either a string or an array of strings for several columns
    // * `val` :
    // * `options` :
    //
    var each_mapped_obj = (obj) =>
      _.every(
        _.toPairs(criteria).map(([key, val]) => {
          if (_.isArray(criteria[key])) {
            return _.includes(criteria[key], obj[key]);
          } else {
            return obj[key] === criteria[key];
          }
        })
      );
    return _.filter(this.data, each_mapped_obj);
  }

  get_row_by_key(key) {
    var key_rows = this.key_rows();
    var i = _.findIndex(key_rows, function (row) {
      return _.isEqual(row, key);
    });
    return this.data[i];
  }

  key_rows() {
    var key_vals = this.get_cols(this.table.keys);
    if (_.keys(key_vals).length === 1) {
      return key_vals[_.keys(key_vals)[0]];
    }
    return _.zip.apply(
      this,
      _.map(key_vals, function (vals, key) {
        return key_vals[key];
      })
    );
  }
}

function query_adapter(subject) {
  //normalize different arguments API
  if (Subject.Dept.lookup(subject)) {
    //patch old dept-id based API
    subject = Subject.Dept.lookup(subject);
  }
  // work around for new subject data structures
  if (subject && subject === Subject.Gov) {
    subject = undefined;
  } else if (
    this.programs &&
    subject &&
    _.includes(["tag", "crso"], subject.level)
  ) {
    const rows = _.chain(subject.programs)
      .map((program) => this.programs.get(program))
      .flatten()
      .compact()
      .value();
    return new Queries(this, rows, subject);
  } else if (this.programs && subject && subject.level === "program") {
    const rows = this.programs.get(subject) || [];
    return new Queries(this, rows, subject);
  } else if (this.crs && "crso" === subject.level) {
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
