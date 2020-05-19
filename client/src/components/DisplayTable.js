import "./DisplayTable.scss";

import classNames from "classnames";
import text from "../common_text/common_lang.yaml";
import { Subject } from "../models/subject.js";
import { create_text_maker_component, Format } from "./misc_util_components.js";

import { LegendList } from "../charts/legends";
import { SortDirections } from "./SortDirection.js";
import { DebouncedTextInput } from "./DebouncedTextInput.js";
import { DropdownMenu } from "./DropdownMenu.js";

const { text_maker, TM } = create_text_maker_component(text);
const { Dept } = Subject;

export class DisplayTable extends React.Component {
  constructor(props) {
    super(props);

    const { unsorted_initial } = props;
    const {
      visible_ordered_col_keys,
      sort_by,
      searches,
    } = DisplayTable.reset_states(props);

    this.state = {
      descending: !unsorted_initial,
      sort_by,
      visible_ordered_col_keys,
      searches,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { sort_by, visible_ordered_col_keys, searches } = prevState;
    const all_col_keys = _.keys(nextProps.column_configs);
    const col_keys_changed =
      !_.includes(all_col_keys, sort_by) ||
      _.intersection(all_col_keys, visible_ordered_col_keys).length <
        visible_ordered_col_keys.length ||
      _.intersection(all_col_keys, _.keys(searches)).length <
        _.keys(searches).length;
    return col_keys_changed ? DisplayTable.reset_states(nextProps) : prevState;
  }

  static reset_states(props) {
    const { unsorted_initial, column_configs } = props;
    const col_configs_with_defaults = DisplayTable.get_col_configs_with_defaults(
      column_configs
    );

    const visible_ordered_col_keys = _.chain(col_configs_with_defaults)
      .pickBy((col) => col.initial_visible)
      .map(({ index }, key) => [index, key])
      .sortBy(_.first)
      .map(_.last)
      .value();

    const sort_by = unsorted_initial
      ? null
      : _.chain(col_configs_with_defaults)
          .pickBy((col) => col.is_sortable)
          .keys()
          .first()
          .value();

    const searches = _.chain(col_configs_with_defaults)
      .pickBy((col) => col.is_searchable)
      .mapValues(() => "")
      .value();
    return { visible_ordered_col_keys, sort_by, searches };
  }

  static get_col_configs_with_defaults(column_configs) {
    const column_config_defaults = {
      initial_visible: true,
      is_sortable: true,
      is_summable: false,
      is_searchable: false,
      sum_func: (sum, value) => sum + value,
      sum_initial_value: 0,
    };
    return _.mapValues(column_configs, (supplied_column_config) => ({
      ...column_config_defaults,
      ...supplied_column_config,
    }));
  }

  render() {
    const {
      table_name, // Optional: Name of table
      data, // [ {column_key: 134} ]
      column_configs /*
          index: 0, <- (integer) Zero indexed, order of column. Required
          header: "Organization", <- (string) Name of column. Required
          is_sortable: true, <- (boolean) Default to true
          is_summable: true, <- (boolean) Default to false
          is_searchable: true, <- (boolean) Default to false
          initial_visible: true, <- (boolean) Default to true
          formatter:
            "big_int" <- (string) If it's string, auto formats using types_to_format
            OR
            (value) => <span> {value} </span>, <- (function)  If it's function, column value is passed in
          search_formatter: (value) => Dept.lookup(value).name <- (function) Actual value to search from data. Default to raw value
          sum_func: (sum, value) => ... <- (function) Custom sum func. Default to sum + value
          sort_func: (a, b) => ... <- (function) Custom sort func. Default to _.sortBy
          sum_initial_value: 0 <- (number) Default to 0 */,
    } = this.props;

    const {
      sort_by,
      descending,
      searches,
      visible_ordered_col_keys,
    } = this.state;

    const col_configs_with_defaults = DisplayTable.get_col_configs_with_defaults(
      column_configs
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
            const col_search_value = col_config.search_formatter
              ? col_config.search_formatter(column_value)
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
        if (sort_by) {
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

    const all_ordered_col_keys = _.chain(col_configs_with_defaults)
      .map(({ index }, key) => [index, key])
      .sortBy(_.first)
      .map(_.last)
      .value();

    return (
      <div
        style={{ overflowX: "auto", marginTop: "20px", marginBottom: "20px" }}
      >
        <DropdownMenu
          dropdownContent={
            <LegendList
              items={_.map(all_ordered_col_keys, (key) => ({
                id: key,
                label: col_configs_with_defaults[key].header,
                active: _.includes(visible_ordered_col_keys, key),
              }))}
              onClick={(clicked_key) => {
                this.setState({
                  visible_ordered_col_keys: _.chain(col_configs_with_defaults)
                    .pickBy((col, key) =>
                      _.chain(visible_ordered_col_keys)
                        .toggle_list(clicked_key)
                        .includes(key)
                        .value()
                    )
                    .map(({ index }, key) => [index, key])
                    .sortBy(_.first)
                    .map(_.last)
                    .value(),
                });
              }}
            />
          }
        />
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
              {_.map(visible_ordered_col_keys, (column_key, i) => (
                <th key={i} className={"center-text"}>
                  {col_configs_with_defaults[column_key].header}
                </th>
              ))}
            </tr>
            <tr className="table-header">
              {_.map(visible_ordered_col_keys, (column_key) => {
                const sortable =
                  col_configs_with_defaults[column_key].is_sortable;
                const searchable =
                  col_configs_with_defaults[column_key].is_searchable;

                const current_search_input =
                  (searchable && searches[column_key]) || null;

                return (
                  <th key={column_key} style={{ textAlign: "center" }}>
                    {sortable && (
                      <div
                        onClick={() =>
                          this.setState({
                            sort_by: column_key,
                            descending:
                              this.state.sort_by === column_key
                                ? !this.state.descending
                                : true,
                          })
                        }
                      >
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
                {_.map(visible_ordered_col_keys, (col_key) => (
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
                {_.chain(visible_ordered_col_keys)
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
