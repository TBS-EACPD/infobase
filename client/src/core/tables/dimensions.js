import _ from "lodash";

import d3 from "src/app_bootstrap/d3-bundle.js";

import { Subject } from "../../models/subject.js";
import * as text_maker from "../../models/text.js";

const { Gov } = Subject;

// This module exists to  provides a common interface for querying
// the data associated with each table
//  [make_horizontal_func](#make_horizontal_func) - this uses
//      the d3.nest functionality to group data

//for memoizing purposes
function func_key(col, include_dept, rollup) {
  /// distinction for col is needed because `[col].toString() === col`
  // and if col is an array, a different response is returned

  if (include_dept && include_dept.level === "dept") {
    include_dept = include_dept.unique_id;
  } else if (include_dept === Gov) {
    include_dept = false;
  }

  return [col, include_dept, rollup].join("");
}

//<div id='make_horizontal_func'></div>
// **super important function**
const make_horizontal_func = function (func, table) {
  //
  //  * `func` : [the horizontal dimension function](table_definition.html#dimensions)
  //    recall that func has the signature ({table}) => row => value
  //  * `table` : the table definition object
  //  this function creates a closure and returns `f`,
  //

  const f = function (col, include_dept, rollup) {
    //
    //  all this is heavily based on [d3.nest](https://github.com/mbostock/d3/wiki/Arrays#d3_nest)
    //  see here for [examples](http://bl.ocks.org/phoebebright/raw/3176159/)
    //  before trying to understand this function
    //
    //  * `col` : the desired column to be summed, col can be
    //    undefined, in that case all columns will be
    //    returned , it cal also be an array of columns
    //  * `include_dept`:
    //      Dept object or Dept's unique ID => only uses data from that departments.
    //      Gov, false or true => uses all data
    //      Gov or falsey => end product is filter-value object of arrays
    //      true => end product is filter-value object of objects (the 2nd grouping is indexed by dept id's)
    //  * `rollup`:
    //    rollup collapses the leaves, i.e. the inner groups
    //      If include dept is a Dept object/ID, it will add up the rows within a department and provide department totals in each of the filter groups
    //      If include_dept is a Gov or falsey, it will provide gov totals
    //    false => leaves of the grouping are the row objects from the table itself. (This makes the first col argument useless)
    //    true (default) sums or transforms the leave groups, summing (using their col.formula) only the columns specified in the first argument
    //
    //  the 2nd and 3rd arguments are rather confusing.
    //
    //
    //
    //  example usage for standard objects:
    //  ```javascript
    //    dimension_func = function(options){ //options will contain the table def as the 'table'property
    //       return function(row){
    //         return row["standard object name"]
    //       }
    //     }
    //    horizontal = make_horizontal_func(dimension_func, standard_object_table )
    //
    //    horizontal("last_year_column",true,true )
    //    ->{
    //        "personnel" :  {
    //            org1 : val,
    //            org2 : val,
    //            ...
    //        },
    //        "transfer payments": {
    //            org1 : val,
    //            org2 : val,
    //            ...
    //        }
    //       ...
    //     }
    //  ```
    //
    if (include_dept && include_dept.level === "dept") {
      include_dept = include_dept.unique_id;
    } else if (include_dept === Gov) {
      include_dept = false;
    }

    let nest = d3.nest().key(
      func({
        table,
        //col:_.isArray(col) ? col[0] : col
      })
    );

    var data;
    let col_obj;
    if (col === "*") {
      col = _.chain(table.unique_headers)
        .map((nick) => table.col_from_nick(nick))
        .filter((col) => !col.key && col.not_for_display !== true)
        .map("nick")
        .value();
    }

    if (_.isArray(col)) {
      col_obj = _.map(col, (e) => table.col_from_nick(e));
    } else {
      col_obj = table.col_from_nick(col);
    }

    // table has  data attached and the requested
    // department exists as well
    if (table.depts && table.depts[include_dept]) {
      // narrow in on just the departmental data
      data = table.depts[include_dept];
      // force the `include_dept` value to false
      include_dept = false;
    } else {
      // the queried data will be all the table data
      data = table.data;
      // if `de_dept` is not defined then set the default
      // to true
      include_dept = include_dept === false ? false : true;
    }
    // if `rollup` is not defined then set the default
    // to true
    rollup = rollup === false ? false : true;
    // if func is a function, then call it and pass along
    // `table` and `col` to produce a key function
    //

    if (include_dept) {
      // add a sub-key function to break out departments
      nest.key(_.property("dept"));
    }
    if (rollup) {
      nest = nest.rollup(function (leaves) {
        if (_.isArray(col)) {
          return _.map(col, function (_col, i) {
            return col_obj[i].formula(leaves);
          });
        } else {
          return col_obj.formula(leaves);
        }
      });
    }

    //return { entry: nest.entries(data), map: nest.map(data) };
    return nest.object(data);
  };

  // for optimization purposes, use the underscore
  // memoize ability to ensure that repeated calls
  // to this function can be answered instantly,
  // the resolver function above ensures the returned
  // data is paired with the unique arguments
  return _.memoize(f, func_key);
};

export const trivial_dimension = {
  title_key: "all",
  include_in_report_builder: true,
  filter_func: () => () => text_maker("all"),
};

export function attach_dimensions(table) {
  // create additional, more specialized horizontal dimensions
  _.each(table.dimensions, (dimension, ix) => {
    const table_attr_name = dimension.title_key;
    table[table_attr_name] = make_horizontal_func(dimension.filter_func, table);

    dimension.table_attr_name = table_attr_name;
    dimension.filter_func = _.bind(dimension.filter_func, dimension);

    if (ix === 0) {
      // add the first dimension under another common name of "horizontal"
      table.horizontal = table[table_attr_name];
    }
  });
}

/*

this will mutate the table data row object by adding properties
we keep track of which tables have been enhanced with booleans indexed by table_id's 
Note that it will *NOT* add column definitions in the column_tree, 

it will use the dimension_key attribute as the extra property on the table.data rows

*/

const enhanced_tables_by_id = {};
export function fill_dimension_columns(table) {
  if (!enhanced_tables_by_id[table.id]) {
    _.chain(table.dimensions)
      .reject("exclude_from_rpb")
      .each((dim_obj) => {
        const dim_key = dim_obj.title_key;
        const bound_filter_func = dim_obj.filter_func({ table });
        _.each(table.data, (row) => {
          row[dim_key] = bound_filter_func(row);
        });
      })
      .value();

    enhanced_tables_by_id[table.id] = true;
  }
}
