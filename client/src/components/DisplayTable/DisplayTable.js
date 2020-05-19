import "./DisplayTable.scss";

import classNames from "classnames";
import { Subject } from "../../models/subject.js";
import {
  create_text_maker_component,
  Format,
} from "../misc_util_components.js";

import { DisplayTableUtils } from "./DisplayTableUtils.js";
import { SortDirections } from "../SortDirection.js";
import { DebouncedTextInput } from "../DebouncedTextInput.js";

const { text_maker, TM } = create_text_maker_component();
const { Dept } = Subject;

export class DisplayTable extends React.Component {
  constructor(props) {
    super(props);

    this.sort_click.bind(this);

    const { unsorted_initial, column_configs } = props;

    const sort_by = unsorted_initial
      ? null
      : _.chain(column_configs)
          .pickBy((col) => col.is_sortable)
          .keys()
          .first()
          .value();

    const searches = _.chain(column_configs)
      .pickBy((col) => col.is_searchable)
      .mapValues(() => "")
      .value();

    this.state = {
      sort_by,
      descending: !unsorted_initial,
      searches,
    };
  }

  sort_click(column_key) {
    this.setState({
      sort_by: column_key,
      descending:
        this.state.sort_by === column_key ? !this.state.descending : true,
    });
  }

  render() {
    const {
      table_name, // Optional: Name of table
      data, // [ {column_key: 134} ]
      column_configs /* {
        column_key: {
          index: 0, <- (integer) Zero indexed, order of column. Required
          header: "Organization", <- (string) Name of column. Required
          is_sortable: true, <- (boolean) Default to true
          is_summable: true, <- (boolean) Default to false
          is_searchable: true, <- (boolean) Default to false
          formatter:
            "big_int" <- (string) If it's string, auto formats using types_to_format
            OR
            (value) => <span> {value} </span>, <- (function)  If it's function, column value is passed in
          raw_formatter: (value) => Dept.lookup(value).name <- (function) Actual raw value from data. Used for searching/csv string Default to value
          sum_func: (sum, value) => ... <- (function) Custom sum func. Default to sum + value
          sort_func: (a, b) => ... <- (function) Custom sort func. Default to _.sortBy
          sum_initial_value: 0 <- (number) Default to 0
        },
      }
      */,
    } = this.props;
    const { sort_by, descending, searches } = this.state;

    const column_config_defaults = {
      is_sortable: true,
      is_summable: false,
      is_searchable: false,
      sum_func: (sum, value) => sum + value,
      sum_initial_value: 0,
    };
    const col_configs_with_defaults = _.mapValues(
      column_configs,
      (supplied_column_config) => ({
        ...column_config_defaults,
        ...supplied_column_config,
      })
    );

    const clean_search_string = (search_string) =>
      _.chain(search_string).deburr().toLower().trim().value();
    const is_number_string_date = (val) =>
      _.isNumber(val) || _.isString(val) || _.isDate(val);
    const sorted_filtered_data = _.chain(data)
      .filter((row) =>
        _.chain(row)
          .map((column_value, column_key) => {
            const col_config = col_configs_with_defaults[column_key];
            const col_search_value = col_config.raw_formatter
              ? col_config.raw_formatter(column_value)
              : column_value;
            return (
              _.isEmpty(searches[column_key]) ||
              _.includes(
                clean_search_string(col_search_value),
                clean_search_string(searches[column_key])
              )
            );
          })
          .every()
          .value()
      )
      .thru((unsorted_array) => {
        if (_.has(col_configs_with_defaults, sort_by)) {
          return col_configs_with_defaults[sort_by].sort_func
            ? _.sortWith(unsorted_array, (a, b) =>
                col_configs_with_defaults[sort_by].sort_func(
                  a[sort_by],
                  b[sort_by]
                )
              )
            : _.sortBy(unsorted_array, (row) =>
                is_number_string_date(row[sort_by])
                  ? row[sort_by]
                  : Number.NEGATIVE_INFINITY
              );
        }
        return unsorted_array;
      })
      .tap(descending ? _.reverse : _.noop)
      .value();

    const total_row = _.reduce(
      sorted_filtered_data,
      (totals, row) =>
        _.mapValues(totals, (total, col_key) =>
          col_configs_with_defaults[col_key].sum_func(total, row[col_key])
        ),
      _.chain(col_configs_with_defaults)
        .pickBy((col) => col.is_summable)
        .mapValues((col) => col.sum_initial_value)
        .value()
    );
    const is_total_exist = !_.isEmpty(total_row);

    const ordered_column_keys = _.chain(col_configs_with_defaults)
      .map(({ index }, key) => [index, key])
      .sortBy(_.first)
      .map(_.last)
      .value();

    const data_csv = [ordered_column_keys].concat(
      _.map(sorted_filtered_data, (row) =>
        _.map(row, (value, key) =>
          col_configs_with_defaults[key].raw_formatter
            ? col_configs_with_defaults[key].raw_formatter(value)
            : value
        )
      )
    );

    return (
      <div
        style={{ overflowX: "auto", marginTop: "20px", marginBottom: "20px" }}
      >
        <DisplayTableUtils data_to_csv_string={d3.csvFormatRows(data_csv)} />
        <table
          className={classNames(
            "table",
            "display-table",
            !is_total_exist && "no-total-row"
          )}
        >
          <caption className="sr-only">
            <div>
              {!_.isEmpty(table_name) ? (
                table_name
              ) : (
                <TM k="a11y_table_title_default" />
              )}
            </div>
          </caption>
          <thead>
            <tr className="table-header">
              {_.map(ordered_column_keys, (column_key, i) => (
                <th key={i} className={"center-text"}>
                  {col_configs_with_defaults[column_key].header}
                </th>
              ))}
            </tr>
            <tr className="table-header">
              {_.map(ordered_column_keys, (column_key) => {
                const sortable =
                  col_configs_with_defaults[column_key].is_sortable;
                const searchable =
                  col_configs_with_defaults[column_key].is_searchable;

                const current_search_input =
                  (searchable && searches[column_key]) || null;

                return (
                  <th key={column_key} style={{ textAlign: "center" }}>
                    {sortable && (
                      <div onClick={() => this.sort_click(column_key)}>
                        <SortDirections
                          asc={!descending && sort_by === column_key}
                          desc={descending && sort_by === column_key}
                        />
                      </div>
                    )}
                    {searchable && (
                      <DebouncedTextInput
                        inputClassName={"search input-sm"}
                        placeHolder={text_maker("filter_data")}
                        defaultValue={current_search_input}
                        updateCallback={(search_value) => {
                          const updated_searches = _.mapValues(
                            searches,
                            (value, key) =>
                              key === column_key ? search_value : value
                          );

                          this.setState({ searches: updated_searches });
                        }}
                        debounceTime={300}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {_.map(sorted_filtered_data, (row, i) => (
              <tr key={i}>
                {_.map(ordered_column_keys, (col_key) => (
                  <td style={{ fontSize: "14px" }} key={col_key}>
                    {col_configs_with_defaults[col_key].formatter ? (
                      _.isString(
                        col_configs_with_defaults[col_key].formatter
                      ) ? (
                        <Format
                          type={col_configs_with_defaults[col_key].formatter}
                          content={row[col_key]}
                        />
                      ) : (
                        col_configs_with_defaults[col_key].formatter(
                          row[col_key]
                        )
                      )
                    ) : (
                      row[col_key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {is_total_exist && (
              <tr key="total_row">
                <td>{text_maker("total")}</td>
                {_.chain(ordered_column_keys)
                  .tail()
                  .map((col_key) => (
                    <td key={col_key}>
                      {total_row[col_key] ? (
                        col_configs_with_defaults[col_key].formatter ? (
                          _.isString(
                            col_configs_with_defaults[col_key].formatter
                          ) ? (
                            <Format
                              type={
                                col_configs_with_defaults[col_key].formatter
                              }
                              content={total_row[col_key]}
                            />
                          ) : (
                            col_configs_with_defaults[col_key].formatter(
                              total_row[col_key]
                            )
                          )
                        ) : (
                          total_row[col_key]
                        )
                      ) : (
                        ""
                      )}
                    </td>
                  ))
                  .value()}
              </tr>
            )}
          </tbody>
        </table>
        {sorted_filtered_data.length === 0 && (
          <TM
            k="no_data"
            el="div"
            style={{ width: "100%", textAlign: "center" }}
          />
        )}
      </div>
    );
  }
}
export const sort_func_template = (a_name, b_name) => {
  if (a_name < b_name) {
    return -1;
  } else if (a_name > b_name) {
    return 1;
  }
  return 0;
};

export const default_dept_name_sort_func = (a, b) => {
  if (a && b) {
    const a_name = Dept.lookup(a).name.toUpperCase();
    const b_name = Dept.lookup(b).name.toUpperCase();
    return sort_func_template(a_name, b_name);
  }
  return 0;
};
