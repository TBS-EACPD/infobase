import { sum } from "d3-array";
import { csvParseRows } from "d3-dsv";
import _ from "lodash";

import { Dept, Gov } from "src/models/subjects";

import {
  trivial_text_maker,
  run_template,
  create_text_maker,
} from "src/models/text";
import { make_store } from "src/models/utils/make_store";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";
import { formats } from "src/core/format";
import { lang } from "src/core/injected_build_constants";

import { get_static_url, make_request } from "src/request_utils";

const table_id_to_csv_path = (table_id) => `csv/${_.snakeCase(table_id)}.csv`;

function add_child(x) {
  // this === a column parent
  if (!_.isArray(x)) {
    x = [x];
  }
  _.each(x, (col) => {
    if (_.isString(col)) {
      col = { header: { en: col, fr: col } };
    }
    col.parent = this;
    this.table.add_col(col);
    col.wcag = col.parent.table.column_counter();
    col.level = col.parent.level + 1;
    col.table = col.parent.table;
  });
  this.children = (this.children || []).concat(x);
  return this;
}

export function filter_row_by_subj(row, subject) {
  switch (subject.subject_type) {
    case "gov": {
      return _.identity(row);
    }
    case "dept": {
      return row.dept == subject.id;
    }
    case "program": {
      return row.program_id == subject.id;
    }
    default: {
      throw new Error("Subject type is not valid.");
    }
  }
}

class Mapper {
  constructor(def) {
    this.def = def;
    if (def.dept_is_not_index_0) {
      //certain tables don't report at the department level, this hack accomodates them
      this.map = this._non_default_map;
    }
  }
  get key() {
    return this.def.id;
  }
  get mapper() {
    return this.def.mapper;
  }
  get sort() {
    return this.def.sort || _.identity;
  }
  get lang() {
    //mappers deal with data entry, they need to know about language.
    return lang;
  }
  map(row) {
    // remap to orgIDs
    if (row[0] !== "ZGOC") {
      row[0] = Dept.store.lookup(row[0]).id;
    }
    // row.slice creates a copy of an array
    return this.mapper(row.slice());
  }
  _non_default_map(row) {
    return this.mapper(row.slice());
  }
}

class Queries {
  constructor(table, data, subject) {
    this.table = table;
    this.lang = lang;
    this.dept = subject && subject.subject_type === "dept" && subject.id;
    this.subject = subject;
    this.data = data;
    _.extend(this, table.queries);
  }

  sum_cols(rows, cols) {
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

export class Table {
  static store = make_store(
    (def) => new Table(def),
    (inst) => (inst.legacy_id ? [inst.legacy_id] : [])
  );

  static default_props() {
    //this will merged over with table_defs props
    return {
      is_table: true, //hacky way to check something is a table
      "footnote-topics": {
        group: "*",
        table: "*",
      },
      sort: _.identity,
      process_mapped_row: _.identity,
    };
  }
  constructor(table_def) {
    const { title: title_def, name: name_def, tags: tags_def } = table_def;

    const name = name_def[lang];

    Object.assign(
      this,
      this.constructor.default_props(),
      _.omit(table_def, ["title", "name", "tags"]),
      {
        name,
        title_def,
        tags: (tags_def || []).concat(table_def.id),
      }
    );

    if (this.subject_type === "program") {
      this.programs = new Map();
    } else if (this.subject_type === "crso") {
      this.crs = new Map();
    }
    this.val = this.id;
    this._cols = [];
    this.flat_headers = [];
    this.data = [];
    this["footnote-topics"].group = this["footnote-topics"].group || "*";
    this["footnote-topics"].table = this["footnote-topics"].table || "*";
    this.column_counter = (() => {
      let val = 0;
      return () => ++val;
    })();
    this.loaded = false;

    this.init();
  }
  init() {
    //start using the table def!
    this.add_cols();
    this.add_fully_qualified_col_name(lang);

    //eslint-disable-next-line
    const to_chain = _.chain(this.flat_headers);

    to_chain
      .filter((col) => !_.isUndefined(col.formula))
      .each((col) => {
        var formula = col.formula;
        col.formula = (data) => formula(this, data);
      })
      .value();

    to_chain
      .filter(function (col) {
        return (
          col.type !== "int" &&
          col.type !== "str" &&
          col.type !== "wide-str" &&
          _.isUndefined(col.formula)
        );
      })
      .each(function (col) {
        col.formula = function (data) {
          if (_.isArray(data)) {
            const to_sum = _.map(data, col.nick || col.wcag);
            if (_.isEmpty(to_sum) || _.every(to_sum, _.isUndefined)) {
              return null;
            }
            return sum(to_sum);
          }
          return data;
        };
        col.formula.default = true;
      })
      .value();

    this.keys = to_chain
      .filter(function (h) {
        return h.key;
      })
      .map(function (h) {
        return h.nick || h.header.en;
      })
      .value();
    this.unique_headers = to_chain
      .filter(function (h) {
        return !h.children;
      })
      .map(function (h) {
        return h.nick || h.wcag;
      })
      .value();

    this.get_group_by_func();
    this.get_grouping_col_values_func();
  }

  get description() {
    const tmf = create_text_maker(this.text);
    return tmf(this.id, {
      table: this,
      table_level: true,
      details: true,
    });
  }
  get short_description() {
    const tmf = create_text_maker(this.text);
    return tmf(this.id + "_short");
  }
  get title() {
    return run_template(this.title_def[lang]);
  }

  get groupings() {
    const cols = _.flatMap(this._cols, (col) =>
      _.has(col, "children") ? col.children : col
    );
    const custom_groupings = _.chain(cols)
      .map("custom_groupings")
      .compact()
      .head()
      .keys()
      .value();
    return _.concat(
      "default",
      _.chain(cols)
        .filter("can_group_by")
        .map("nick")
        .concat(custom_groupings)
        .compact()
        .value()
    );
  }

  is_custom_grouping(grouping) {
    return (
      grouping !== "default" &&
      !_.chain(this._cols)
        .flatMap((col) => (_.has(col, "children") ? col.children : col))
        .map("nick")
        .includes(grouping)
        .value()
    );
  }

  get_grouping_col(grouping) {
    const cols = _.flatMap(this._cols, (col) =>
      _.has(col, "children") ? col.children : col
    );

    return (
      _.chain(cols)
        .filter((col) => col.nick === grouping)
        .head()
        .value() ||
      _.chain(cols)
        .filter((col) => _.has(col, `custom_groupings.${grouping}`))
        .head()
        .value() || { nick: "default" }
    );
  }

  get_group_by_func() {
    this.group_by_func = (data, grouping) => {
      if (!this.is_custom_grouping(grouping)) {
        return _.groupBy(data, grouping);
      }
      return _.groupBy(data, (row) =>
        this.get_grouping_col(grouping).custom_groupings[grouping].group_by(row)
      );
    };
  }

  get_grouping_col_values_func() {
    this.grouping_col_values_func = (row, grouping) => {
      const grouping_col = this.get_grouping_col(grouping);

      if (!this.is_custom_grouping(grouping)) {
        return [grouping, row[grouping]];
      } else {
        return grouping_col.custom_groupings[grouping].grouping_col_value(row);
      }
    };
  }

  get_sum_cols_by_grouped_data_func() {
    this.sum_cols_by_grouped_data = function (col, grouping, subject = Gov) {
      const { data, group_by_func, grouping_col_values_func } = this;

      return _.chain(data)
        .filter((row) => filter_row_by_subj(row, subject))
        .thru((ungrouped_data) => group_by_func(ungrouped_data, grouping))
        .map((data_group) => {
          const grouping_name = grouping_col_values_func(
            data_group[0],
            grouping
          )[1];
          const summed_col = _.isArray(col)
            ? _.map(col, (c) => _.sumBy(data_group, c))
            : _.sumBy(data_group, col);
          return [grouping_name, summed_col];
        })
        .fromPairs()
        .value();
    };
  }

  get_col_header(col, grouping) {
    if (
      !this.is_custom_grouping(grouping) ||
      col.nick !== this.get_grouping_col(grouping).nick
    ) {
      return col.fully_qualified_name;
    }
    return trivial_text_maker(grouping);
  }

  column_description(col_nick) {
    return run_template(this.col_from_nick(col_nick).description[lang]);
  }

  col_from_nick(nick) {
    // find a column obj from either the nick name or the wvag uniq ID
    return (
      _.find(
        this.flat_headers,
        (col) => col.nick === nick || col.wcag === +nick
      ) || false
    );
  }
  add_col(x) {
    // this === a table obj or null
    if (x && x.nick === "dept") {
      x.header = { [lang]: trivial_text_maker("department") };
    }
    if (_.isString(x)) {
      x = { header: { en: x, fr: x } };
    }
    if (_.isString(x.header)) {
      x.header = { en: x.header, fr: x.header };
    }
    x.table = this;
    if (!_.has(x, "key")) {
      x.key = false;
    }
    if (!_.has(x, "parent")) {
      // ask for a unique attribute for this header
      // this will be used for adding header links
      // to able cells as per WCAG standard
      x.wcag = x.table.column_counter();
      this._cols.push(x);
      x.level = 0;
    }
    if (!_.has(x, "hidden")) {
      x.hidden = false;
    }
    this.flat_headers.push(x);
    x.add_child = add_child;
    return x;
  }
  add_fully_qualified_col_name(lang) {
    this.flat_headers
      // filter out nodes with children and  key nodes
      .filter((header) => _.isUndefined(header.children))
      .forEach((col) => {
        if (!col.header) {
          return;
        }
        let name = col.header[lang];
        let pointer = col;
        while (pointer.parent) {
          pointer = pointer.parent;
          if (pointer.header[lang].length > 0) {
            name = pointer.header[lang] + " - " + name;
          }
        }
        // run this once and attach to the col obj
        col.fully_qualified_name = run_template(name);
      });
  }
  populate_with_data(data) {
    data = _.trim(data);
    const row_transf = this.get_row_func();
    const parsed_data = csvParseRows(data);

    data = _.chain(parsed_data)
      .tail()
      .map(row_transf)
      .each((row) => this.process_mapped_row(row))
      .groupBy((row) => row.dept === "ZGOC")
      .value();
    this.csv_headers = _.head(parsed_data);
    this.data = data[false];
    this.GOC = data[true];

    this.depts = {};

    _.each(this.data, (row) => {
      if (!this.depts[row.dept]) {
        this.depts[row.dept] = [row];
      } else {
        this.depts[row.dept].push(row);
      }
    });

    this.q = query_adapter;
    this.get_sum_cols_by_grouped_data_func();
  }
  //TODO: optimize and clarify this
  get_row_func() {
    var mapper = new Mapper(this);
    return (row, index) => {
      //apply the mapper

      var mapped_row = mapper.map(row);
      // turn the array of data into an object with keys based on the defined columns
      var row_obj = _.zipObject(this.unique_headers, mapped_row);
      _.toPairs(row_obj).forEach((pair) => {
        const [key, val] = pair;
        const type = this.col_from_nick(key).type;
        // in case we have numbers represented as string, we'll convert them to integers
        // need to handle custom cases of '.', '', and '-'
        if (
          _.includes(
            [
              "percentage",
              "decimal",
              "decimal1",
              "decimal2",
              "percentage1",
              "percentage2",
              "dollar",
            ],
            type
          ) &&
          !_.isNaN(parseFloat(val))
        ) {
          row_obj[key] = parseFloat(val);
        } else if (
          (type === "big_int" || type === "int") &&
          !_.isNaN(parseFloat(val))
        ) {
          row_obj[key] = parseFloat(val);
        } else if (
          _.includes([".", "", "-"], val) &&
          _.includes(
            [
              "percentage",
              "decimal",
              "decimal1",
              "decimal2",
              "percentage1",
              "percentage2",
              "big_int",
              "big_int",
              "int",
              "dollar",
            ],
            type
          )
        ) {
          row_obj[key] = 0;
        }
      });
      _.toPairs(row_obj).forEach(([key, _val]) => {
        const col = this.col_from_nick(key);
        if (col.formula && _.isUndefined(col.formula.default)) {
          row_obj[key] = col.formula(row_obj);
        }
      });

      row_obj.csv_index = index;

      return row_obj;
    };
  }
  load() {
    return make_request(get_static_url(table_id_to_csv_path(this.id)))
      .then((resp) => resp.text())
      .then((data) => {
        this.populate_with_data(data);
        this.loaded = true;
      });
  }
}

assign_to_dev_helper_namespace({ Table });
