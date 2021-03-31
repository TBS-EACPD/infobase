import classNames from "classnames";
import { csvFormatRows } from "d3-dsv";
import _ from "lodash";
import React from "react";

import { DebouncedTextInput } from "src/components/DebouncedTextInput.js";
import {
  create_text_maker_component,
  Format,
} from "src/components/misc_util_components.js";
import { SortDirections } from "src/components/SortDirection.js";
import { SpinnerWrapper } from "src/components/SpinnerWrapper.js";

import { LegendList } from "src/charts/legends/LegendList.js";

import { toggle_list } from "src/general_utils.js";

import {
  DisplayTableCopyCsv,
  DisplayTableDownloadCsv,
  DisplayTableColumnToggle,
  SelectPage,
  SelectPageSize,
} from "./DisplayTableUtils.js";

import text from "./DisplayTable.yaml";
import "./DisplayTable.scss";

const { text_maker, TM } = create_text_maker_component(text);

const column_config_defaults = {
  initial_visible: true,
  is_sortable: true,
  is_summable: false,
  is_searchable: false,
  sum_func: (sum, value) => sum + value,
  raw_formatter: _.identity,
  sum_initial_value: 0,
};
const get_col_configs_with_defaults = (column_configs) =>
  _.mapValues(column_configs, (supplied_column_config) => ({
    // Set visibility_toggleable default based off index
    visibility_toggleable: supplied_column_config.index !== 0,
    ...column_config_defaults,
    ...supplied_column_config,
  }));
const get_default_state_from_props = (props) => {
  const { unsorted_initial, column_configs } = props;

  const col_configs_with_defaults = get_col_configs_with_defaults(
    column_configs
  );

  const visible_col_keys = _.chain(col_configs_with_defaults)
    .pickBy((col) => col.initial_visible)
    .keys()
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

  return {
    visible_col_keys,
    sort_by,
    descending: false,
    searches,
    initial_props: props,
    page_size: props.page_size_increment,
  };
};

/* Assumption: DisplayTable assumes 1st column to be string that describes its row
  - If total row exists, 1st column will have the word "Total"
  - 1st column cannot be toggled off by user
  - Total row color is set to $textLightColor, see total_color
*/
export class DisplayTable extends React.Component {
  constructor(props) {
    super(props);

    this.first_data_ref = React.createRef();

    this.state = {
      ...get_default_state_from_props(props),
      current_page: 0,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps !== prevState.initial_props) {
      const new_default_state = get_default_state_from_props(nextProps);

      const prev_sort_still_valid = _.includes(
        new_default_state.visible_col_keys,
        prevState.sort_by
      );

      const reconciled_searches = {
        ...new_default_state.searches,
        ..._.pick(prevState.searches, new_default_state.visible_col_keys),
      };

      return {
        ...new_default_state,
        ...(prev_sort_still_valid && {
          sort_by: prevState.sort_by,
          descending: prevState.descending,
        }),
        searches: reconciled_searches,
      };
    } else {
      return null;
    }
  }

  change_page_size = (new_page_size) =>
    this.state.page_size !== new_page_size &&
    this.setState({
      loading: true,
      page_size: new_page_size,
      current_page: 0,
    });

  change_page = (page) =>
    this.state.current_page !== page &&
    this.setState({
      loading: true,
      current_page: page,
    });

  debounced_stop_loading = _.debounce(
    () => this.setState({ loading: false }),
    100
  );

  debounced_first_data_focus = _.debounce(
    () => this.first_data_ref.current.focus(),
    100
  );

  componentDidUpdate(prev_props, prev_state) {
    const { loading } = this.state;
    const { loading: prev_loading } = prev_state;
    if (loading) {
      this.debounced_stop_loading();
    } else if (prev_loading && !loading) {
      this.debounced_first_data_focus();
    }
  }

  componentWillUnmount() {
    this.debounced_first_data_focus.cancel();
    this.debounced_stop_loading.cancel();
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
          initial_visible: true, <- (boolean) Default to true
          formatter:
            "big_int" <- (string) If it's string, auto formats using types_to_format
            OR
            (value) => <span> {value} </span>, <- (function)  If it's function, column value is passed in
          raw_formatter: (value) => Dept.lookup(value).name <- (function) Actual raw value from data. Used for sorting/searching/csv string. Default to value
          sum_func: (sum, value) => ... <- (function) Custom sum func. Default to sum + value
          sort_func: (a, b) => ... <- (function) Custom sort func. Default to _.sortBy
          sum_initial_value: 0 <- (number) Default to 0
          visibility_toggleable: true <- (boolean) Defaults to false for index 0, true for all other indexes.
        },
      }
      */,
      page_size_increment,
      util_components,
      enable_pagination,
      page_size_num_options_max,
      disable_column_select,
    } = this.props;
    const {
      sort_by,
      descending,
      searches,
      visible_col_keys,
      page_size,
      current_page,
      loading,
    } = this.state;

    const col_configs_with_defaults = get_col_configs_with_defaults(
      column_configs
    );
    const NoDataMessage = () => (
      <tbody>
        <tr>
          <td style={{ padding: 0 }} colSpan={_.size(visible_col_keys)}>
            <div
              style={{ borderRadius: 0, margin: 0 }}
              className="card large_panel_text no-data-msg"
            >
              {text_maker("no_data_table")}
            </div>
          </td>
        </tr>
      </tbody>
    );

    const determine_text_align = (row, col) => {
      const current_col_formatter = col_configs_with_defaults[col].formatter;
      const current_col_raw_formatter =
        col_configs_with_defaults[col].raw_formatter;
      return (_.isString(current_col_formatter) && _.isNumber(row[col])) ||
        _.isNumber(current_col_raw_formatter(row[col]))
        ? "right"
        : "left";
    };

    const clean_search_string = (search_string) =>
      _.chain(search_string).deburr().toLower().trim().value();
    const is_number_string_date = (val) =>
      _.isNumber(val) || _.isString(val) || _.isDate(val);
    const sorted_filtered_data = _.chain(data)
      .filter((row) =>
        _.chain(row)
          .map((column_value, column_key) => {
            const col_config = col_configs_with_defaults[column_key];
            const col_search_value =
              col_config && col_config.raw_formatter
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
          const sorting_config = col_configs_with_defaults[sort_by];
          return sorting_config.sort_func
            ? _.map(unsorted_array).sort((a, b) =>
                sorting_config.sort_func(a[sort_by], b[sort_by], descending)
              )
            : _.sortBy(unsorted_array, (row) =>
                is_number_string_date(
                  sorting_config.raw_formatter(row[sort_by])
                ) /*Please Leave On: sorting data containing BOTH string and date is not consistent 
                 It's probably trying to cast string into date object and if that fails, it probably stops sorting.
                 Better off just building a sort function to handle it*/
                  ? sorting_config.raw_formatter(row[sort_by])
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
    const visible_ordered_col_keys = _.intersection(
      all_ordered_col_keys,
      visible_col_keys
    );
    const csv_string = _.chain(visible_ordered_col_keys)
      .map((key) => col_configs_with_defaults[key].header)
      .thru((header_row) => [header_row])
      .concat(
        _.map(sorted_filtered_data, (row) =>
          _.map(visible_ordered_col_keys, (key) =>
            col_configs_with_defaults[key].raw_formatter(row[key])
          )
        )
      )
      .thru((csv_data) => csvFormatRows(csv_data))
      .value();

    const hide_column_select =
      disable_column_select ||
      (_.size(all_ordered_col_keys) <= 2 &&
        _.every(col_configs_with_defaults, "initial_visible"));
    const util_components_default = {
      copyCsvUtil: (
        <DisplayTableCopyCsv key="copyCsvUtil" csv_string={csv_string} />
      ),
      downloadCsvUtil: (
        <DisplayTableDownloadCsv
          key="downloadCsvUtil"
          csv_string={csv_string}
          table_name={table_name}
        />
      ),
      columnToggleUtil: !hide_column_select && (
        <DisplayTableColumnToggle
          key="columnToggleUtil"
          columns={
            <LegendList
              items={_.map(all_ordered_col_keys, (key) => ({
                id: key,
                label: col_configs_with_defaults[key].header,
                active: _.includes(visible_ordered_col_keys, key),
              }))}
              onClick={(clicked_key) => {
                col_configs_with_defaults[clicked_key].visibility_toggleable &&
                  this.setState({
                    visible_col_keys: toggle_list(
                      visible_col_keys,
                      clicked_key
                    ),
                  });
              }}
            />
          }
        />
      ),
    };
    const util_components_with_defaults = _.chain({
      ...util_components_default,
      ...util_components,
    })
      .map()
      .reverse()
      .value();

    const paginated_data = _.chunk(
      sorted_filtered_data,
      !enable_pagination ? _.size(sorted_filtered_data) : page_size
    );

    const number_of_pages = paginated_data.length;

    const page_selector = enable_pagination && (
      <SelectPage
        num_pages={number_of_pages}
        current_page={current_page}
        change_page={this.change_page}
        num_col={_.size(visible_ordered_col_keys)}
      />
    );

    return (
      <div
        className={classNames(
          "display-table-container",
          util_components_with_defaults && "display-table-container--with-utils"
        )}
      >
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
            {util_components_with_defaults && (
              <tr>
                <td
                  style={{ padding: "8px 8px 0px 8px" }}
                  colSpan={_.size(visible_col_keys)}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      {enable_pagination && (
                        <SelectPageSize
                          selected={page_size}
                          on_select={this.change_page_size}
                          page_size_increment={page_size_increment}
                          num_items={_.size(sorted_filtered_data)}
                          num_options_max={page_size_num_options_max}
                        />
                      )}
                    </div>
                    <div className={"display-table-container__utils"}>
                      <button
                        tabIndex={0}
                        className={"skip-to-data"}
                        onClick={() => this.first_data_ref.current.focus()}
                      >
                        {text_maker("skip_to_data")}
                      </button>
                      {_.map(util_components_with_defaults)}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            <tr className="table-header">
              {_.map(visible_ordered_col_keys, (column_key, i) => (
                <th key={i} className={"center-text"}>
                  {col_configs_with_defaults[column_key].header}
                </th>
              ))}
            </tr>
            {_.some(col_configs_with_defaults, "is_sortable") && (
              <tr className="table-header">
                {_.map(visible_ordered_col_keys, (column_key) => {
                  const sortable =
                    col_configs_with_defaults[column_key].is_sortable;
                  const searchable =
                    col_configs_with_defaults[column_key].is_searchable;

                  const current_search_input =
                    (searchable && searches[column_key]) || null;

                  return (
                    <td key={column_key} style={{ textAlign: "center" }}>
                      {sortable && (
                        <div
                          onClick={() =>
                            this.setState({
                              sort_by: column_key,
                              descending:
                                this.state.sort_by === column_key
                                  ? !this.state.descending
                                  : true,
                              current_page: 0,
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
                          a11y_label={text_maker("filter_data")}
                          defaultValue={current_search_input}
                          updateCallback={(search_value) => {
                            const updated_searches = _.mapValues(
                              searches,
                              (value, key) =>
                                key === column_key ? search_value : value
                            );

                            this.setState({
                              searches: updated_searches,
                              current_page: 0,
                            });
                          }}
                          debounceTime={300}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            )}
            {page_selector}
          </thead>
          {loading && (
            <tbody>
              <tr>
                <td
                  style={{
                    color: "white",
                    position: "relative",
                    height: "100px",
                  }}
                  colSpan={_.size(visible_ordered_col_keys)}
                >
                  <SpinnerWrapper ref="spinner" config_name="tabbed_content" />
                </td>
              </tr>
            </tbody>
          )}
          {!loading &&
            (_.isEmpty(visible_ordered_col_keys) ? (
              <NoDataMessage />
            ) : (
              <tbody>
                {_.map(paginated_data[current_page], (row, i) => (
                  <tr key={i}>
                    {_.map(visible_ordered_col_keys, (col_key, idx) => (
                      <td
                        style={{
                          fontSize: "14px",
                          textAlign: determine_text_align(row, col_key),
                        }}
                        key={col_key}
                        tabIndex={-1}
                        ref={idx === 0 && i === 0 ? this.first_data_ref : null}
                      >
                        {col_configs_with_defaults[col_key].formatter ? (
                          _.isString(
                            col_configs_with_defaults[col_key].formatter
                          ) ? (
                            <Format
                              type={
                                col_configs_with_defaults[col_key].formatter
                              }
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
                  <tr key="total_row" className="total-row">
                    <td className="total_color">{text_maker("total")}</td>
                    {_.chain(visible_ordered_col_keys)
                      .tail()
                      .map((col_key) => (
                        <td
                          className="total_color"
                          style={{
                            textAlign: determine_text_align(total_row, col_key),
                          }}
                          key={col_key}
                        >
                          {(() => {
                            const has_total_row = total_row[col_key];
                            if (has_total_row) {
                              const has_formatter =
                                col_configs_with_defaults[col_key].formatter;
                              if (has_formatter) {
                                const is_formatter_string = _.isString(
                                  col_configs_with_defaults[col_key].formatter
                                );
                                if (is_formatter_string) {
                                  return (
                                    <Format
                                      type={
                                        col_configs_with_defaults[col_key]
                                          .formatter
                                      }
                                      content={total_row[col_key]}
                                    />
                                  );
                                } else {
                                  return col_configs_with_defaults[
                                    col_key
                                  ].formatter(total_row[col_key]);
                                }
                              } else {
                                return total_row[col_key];
                              }
                            } else {
                              return "";
                            }
                          })()}
                        </td>
                      ))
                      .value()}
                  </tr>
                )}
              </tbody>
            ))}
          <tfoot>{page_selector}</tfoot>
        </table>

        {sorted_filtered_data.length === 0 && (
          <TM
            k="no_data_table"
            el="div"
            style={{ width: "100%", textAlign: "center" }}
          />
        )}
      </div>
    );
  }
}
DisplayTable.defaultProps = {
  page_size_increment: 100,
  enable_pagination: true,
  page_size_num_options_max: 5,
};

// Wrapper component that picks column configs based on the size of data. Currently cannot pick table utils
export class SmartDisplayTable extends React.Component {
  render() {
    const { data, show_search, show_sort, column_configs } = this.props;
    const col_configs_with_defaults = get_col_configs_with_defaults(
      column_configs
    );

    const showing_sort = show_sort || _.size(data) > 2;
    const showing_search = show_search || _.size(data) > 5;
    const smart_column_configs = _.mapValues(
      col_configs_with_defaults,
      (supplied_column_config) => ({
        ...supplied_column_config,
        is_searchable: supplied_column_config.is_searchable && showing_search,
        is_sortable: supplied_column_config.is_sortable && showing_sort,
      })
    );
    return (
      <DisplayTable
        {...this.props}
        column_configs={smart_column_configs}
        enable_pagination={
          _.size(data) > DisplayTable.defaultProps.page_size_increment
        }
      />
    );
  }
}
