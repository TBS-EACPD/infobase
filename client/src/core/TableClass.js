import { sum } from "d3-array";
import { csvParseRows } from "d3-dsv";
import _ from "lodash";

import { make_unique_func, make_unique } from "src/general_utils.js";
import { sources as all_sources } from "src/metadata/data_sources.js";
import { mix, staticStoreMixin } from "src/models/storeMixins.js";
import { Subject } from "src/models/subject.js";
import {
  trivial_text_maker,
  run_template,
  create_text_maker,
} from "src/models/text.js";
import { get_static_url, make_request } from "src/request_utils.js";

import { assign_to_dev_helper_namespace } from "./assign_to_dev_helper_namespace.js";
import { lang } from "./injected_build_constants.js";

import {
  attach_dimensions,
  fill_dimension_columns,
  trivial_dimension,
} from "./tables/dimensions.js";
import { query_adapter } from "./tables/queries.js";

const table_id_to_csv_path = (table_id) => `csv/${_.snakeCase(table_id)}.csv`;
const { Dept } = Subject;

function all_children_hidden(header) {
  if (header.children) {
    return _.every(header.children, all_children_hidden);
  }
  return header.hidden;
}

function calc_col_span(header) {
  if (header.children) {
    return _.chain(header.children)
      .map(calc_col_span)
      .reduce((x, y) => x + y)
      .value();
  }
  if (header.hidden) {
    return 0;
  } else {
    return 1;
  }
}

// some helper functions
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
      row[0] = Dept.lookup(row[0]).unique_id;
    }
    // row.slice creates a copy of an array
    return this.mapper(row.slice());
  }
  _non_default_map(row) {
    return this.mapper(row.slice());
  }
}

export class Table extends mix().with(staticStoreMixin) {
  static create_and_register(def) {
    const inst = new Table(def);
    this.register(inst.id, inst);
    inst.legacy_id && this.register(inst.legacy_id, inst);
    return inst;
  }

  static default_props() {
    //this will merged over with table_defs props
    return {
      is_table: true, //hacky way to check something is a table
      "footnote-topics": {
        group: "*",
        table: "*",
      },
      horizontal_group_sort: _.identity,
      sort: _.identity,
      classification: "none",
      link: { en: "", fr: "" }, //some handlebar templates will crash if they don't see a link
      process_mapped_row: _.identity,
    };
  }
  constructor(table_def) {
    super();
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
    this.column_counter = make_unique_func();
    this.loaded = false;

    this.init();
  }
  init() {
    //start using the table def!
    this.add_cols();
    this.add_fully_qualified_col_name(lang);

    if (_.isEmpty(this.dimensions)) {
      this.dimensions = [trivial_dimension];
    }

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
  }
  get links() {
    return this.link
      ? [this.link[lang]]
      : _.map(
          this.source,
          (source_key) => all_sources[source_key].open_data[lang]
        );
  }
  get description() {
    const tmf = create_text_maker(this.text);
    return tmf(this.id, {
      table: this,
      table_level: true,
      details: true,
      links: this.links,
    });
  }
  get short_description() {
    const tmf = create_text_maker(this.text);
    return tmf(this.id + "_short");
  }
  get title() {
    return run_template(this.title_def[lang]);
  }

  // input should be an array of lowest-level (i.e. exist in table.unique_headers) columns to be included
  // output is hash of parent columns, indexed by the input columns.
  header_structure(col_nicks) {
    //prefix allows us to display multiple tables at once
    //recall that html IDs shouldn't start with numbers (hence the 'a')
    const prefix = "a" + make_unique();

    //get the array of ancestors for a column
    const ancestor_cols = (col) =>
      col.parent ? [...ancestor_cols(col.parent), col] : [col];

    const id_for_col = (col) => prefix + (col.nick || col.wcag);

    //given a col, returns the header string that points TO it.
    const header_to_col = (col) =>
      id_for_col(col) + (col.parent ? " " + header_to_col(col.parent) : "");

    const colspan_for_col = (col) =>
      _.chain(col_nicks)
        .map((nick) => this.col_from_nick(nick))
        .map(ancestor_cols)
        .filter((ancestors) => _.includes(ancestors, col))
        .value().length;

    //const depth = _.max(this.flat_headers,
    const col_structure = _.chain(col_nicks)
      .map((nick) => this.col_from_nick(nick))
      .map(ancestor_cols)
      .flatten()
      .uniqBy()
      .map((col) => ({
        colspan: colspan_for_col(col),
        level: col.level,
        header_attr: col.parent ? header_to_col(col.parent) : "",
        display: run_template(col.header[lang]),
        id_attr: id_for_col(col),
        nick: col.nick || col.wcag,
      }))
      .groupBy("level")
      .map((group) =>
        _.sortBy(group, (obj) =>
          _.indexOf(this.flat_headers, this.col_from_nick(obj.nick))
        )
      )
      .value();

    const headers_for_cell = _.chain(col_nicks)
      .map((col_nick) => [
        col_nick,
        header_to_col(this.col_from_nick(col_nick)),
      ])
      .zipObject()
      .value();

    return { headers_for_cell, col_structure };
  }

  column_description(col_nick) {
    return run_template(this.col_from_nick(col_nick).description[lang]);
  }

  old_presentation_ready_headers() {
    var flat_headers = this.flat_headers;
    var headers = [];
    _.each(flat_headers, function (header) {
      if (all_children_hidden(header)) {
        return;
      }
      var presentation_copy = {
        val: run_template(header.header[lang]),
        id: header.wcag,
      };
      if (_.isUndefined(headers[header.level])) {
        headers[header.level] = [];
      }
      if (header.parent) {
        var wcag_headers = "";
        var pointer = header;
        while (pointer.parent) {
          pointer = pointer.parent;
          wcag_headers += pointer.wcag + " ";
        }
        presentation_copy.headers = wcag_headers;
      }
      if (header.children) {
        presentation_copy.col_span = calc_col_span(header);
      }
      headers[header.level].push(presentation_copy);
    });
    return headers;
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
    attach_dimensions(this);
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
        // need to handle special cases of '.', '', and '-'
        if (
          _.includes(
            ["percentage", "decimal", "decimal1", "percentage1", "percentage2"],
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
              "percentage1",
              "percentage2",
              "big_int",
              "big_int",
              "int",
            ],
            type
          )
        ) {
          row_obj[key] = 0;
        }
      });
      _.toPairs(row_obj).forEach(([key, val]) => {
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
    return make_request(get_static_url(table_id_to_csv_path(this.id))).then(
      (data) => {
        this.populate_with_data(data);
        this.loaded = true;
      }
    );
  }
  fill_dimension_columns() {
    //wrap it in an instance method
    //because of side-effects
    fill_dimension_columns(this);
  }
}

assign_to_dev_helper_namespace({ Table });
