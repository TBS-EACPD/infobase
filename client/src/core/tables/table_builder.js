import { select } from "d3-selection";
import _ from "lodash";

import { make_unique } from "../../general_utils.js";

//  Generates all the tables displayed on the page
//  * no code repetition
//  * produces wcag compliant tables
//  * the general idea is that [prepares_data](#prepare_data)
//    will be called before [d3_build_table](#d3_build_table),
//    in fact [prepare_and_build_table](#prepare_and_build_table)
//    is provided to do that automatically, although d3_build_table
//    can be called just on its own
//  * the bare minimum needed for either one of these functions
//    is an array of arrays of data and an array of arrays of
//    headers - it is advised using the prep data function since
//    it adds the required wcag compliance
//

// # Title
// prepares data for being presented in a table along with
// wcag requirements
// options is in this format:
//
// required
// * `rows`: an array of arrays of data to be presented in a table
// * `headers` : an array of headers arrays
//
// optional
// * `headers_css` : css to be applied to the headers
// * `options.row_css` : css to be applied to the rows
// * `headers_class` : classes to be applied to the headers
// * `row_class` : classes to be applied to the rows
// <div id='prepare_data'></div>
function prepare_data(options) {
  var dup_header_options = options.dup_header_options;
  var x = dup_header_options;
  var rows = options.rows;
  var headers = options.headers;
  var header_links;

  var headers_css = options.headers_css || new Array(headers[0].length);
  var row_css = x
    ? headers_css
    : options.row_css || new Array(headers[0].length);

  var headers_class = options.headers_class || new Array(headers[0].length);
  var row_class = x
    ? headers_class
    : options.row_class || new Array(headers[0].length);

  if (!options.header_links) {
    header_links = _.map(rows[0], function () {
      return "";
    });

    // process the headers
    _.each(headers, function (header_row, i) {
      _.each(header_row, function (header, j) {
        var wcag_headers;
        var id = make_unique();
        header_links[j] += " " + id;
        if (i > 0) {
          wcag_headers = _.chain(headers)
            .first(i)
            .map(j)
            .map(function (d) {
              return d.id;
            })
            .value()
            .join(" ");
        } else {
          wcag_headers = "";
        }
        header_row[j] = {
          val: header,
          id: id,
          headers: wcag_headers,
          css: headers_css[j],
          class: headers_class[j],
        };
      });
    });
  } else {
    header_links = options.header_links;
  }
  // process the rows
  _.each(rows, function (row, i) {
    _.each(row, function (val, j) {
      var __table_opts__ = {
        headers: _.trim(header_links[j]),
        css: row_css[j],
        class: row_class[j],
      };
      // if already an object
      if (_.isObject(val)) {
        val.__table_opts__ = __table_opts__;
      } else {
        row[j] = {
          val: val,
          __table_opts__: __table_opts__,
        };
      }
    });
  });
}

// based on this [blog posting](http://bost.ocks.org/mike/nest/)
// will build a table dynamically based on the composition of the
// options object:
//
// required
// * `node` : the node where the table will be appended,
// * `rows` : an array of arrays which will turn into table in
//   the following format
//   ```javascript
//     options.rows = [
//      [
//      {"val" : "to_be_displayed",
//       "css": "css for the td",
//       "class": "class to be applied" ,
//       "headers": "the wcag headers"
//      },
//      {},
//      ...
//      ],
//      [],
//      ...
//     ]
//
//   ```
//   you're advised to use the [prepare data fundtion]()#prepare_data above
// * `headers` : the table headers, the same format as options.rows
//
// optional
// * `key_func` : the `.data()` key function to control data binding
// * `table_class` :classes which can be applied to the table
// * `table_css` : css rules applied to the table
// * `headerseach` : function which can be run on each of the table headers
// * `theach` : function which can be run on each of the table headers
// * `stripe` : if true, will add "odd" class to each tbale row for styling
// * `rowseach` :  function which can be run on each of the table rows
// * `tdeach` :  function which can be run on each of the table data cells
//
// <div id='build_table'></div>
const base_class = "infobase-table";
function d3_build_table(options) {
  // if a node isn't provided then create a new one
  options.node = options.node || document.createElement("div");
  var table = select(options.node).append("div").append("table");

  var data_key_func =
    options.key_func ||
    function (d, i) {
      return i;
    };

  table.attr("class", base_class + " table");

  if (options.table_class) {
    table.attr("class", base_class + " " + options.table_class);
  }

  if (options.table_css) {
    table.styles(options.table_css);
  }

  const headers = table.append("thead").selectAll("tr").data(options.headers);

  headers.exit().remove();

  const new_headers = headers
    .enter()
    .append("tr")
    .attr("class", "table-header")
    .order();

  headers.merge(new_headers);

  var ths = new_headers.selectAll("th").data(_.identity);

  ths.exit().remove();

  const new_ths = ths.enter().append("th");

  ths
    .merge(new_ths)
    .html(function (d) {
      return d.val;
    })
    .each(function (d) {
      if (d.css) select(this).style(d.css);
    })
    .attr("id", function (d) {
      return d.id;
    })
    .attr("headers", function (d) {
      return d.headers;
    })
    .attr("class", function (d) {
      return d["class"];
    });

  if (options.headerseach) {
    new_headers.each(options.headerseach);
  }

  if (options.theach) {
    new_ths.each(options.theach);
  }

  var rows = table
    .append("tbody")
    .selectAll("tr")
    .data(options.rows, data_key_func);

  rows.exit().remove();

  const new_rows = rows.enter().append("tr").order();

  rows.merge(new_rows);

  var tds = new_rows.selectAll("td").data(_.identity);

  tds.exit().remove();

  const new_tds = tds.enter().append("td");

  tds
    .merge(new_tds)
    .html(function (d) {
      return d.val;
    })
    .attr("headers", function (d) {
      return d.__table_opts__.headers;
    })
    .attr("class", function (d) {
      return d.__table_opts__["class"];
    })
    .each(function (d) {
      if (d.__table_opts__.css) select(this).style(d.__table_opts__.css);
    });

  if (options.stripe) {
    new_rows.each(function (d, i) {
      if (i % 2 === 1) {
        select(this).classed("odd", true);
      }
    });
  }

  if (options.rowseach) {
    new_rows.each(options.rowseach);
  }

  if (options.tdseach) {
    new_tds.each(options.tdseach);
  }

  return options;
}

// combines the two functions
// <div id='prepare_and_build_table'></div>
function prepare_and_build_table(options) {
  prepare_data(options);
  d3_build_table(options);

  return options.node;
}

export { prepare_and_build_table, prepare_data, d3_build_table };
