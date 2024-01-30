import classNames from "classnames";
import { csvFormatRows } from "d3-dsv";
import _ from "lodash";
import React from "react";

import { DebouncedTextInput } from "src/components/DebouncedTextInput/DebouncedTextInput";
import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";
import {
  create_text_maker_component,
  Format,
} from "src/components/misc_util_components";
import { SortDirections } from "src/components/SortDirection/SortDirection";

import type { FormatKey } from "src/core/format";

import { LegendList } from "src/charts/legends/LegendList";

import { toggle_list } from "src/general_utils";
import { IconCheckmark } from "src/icons/icons";
import { smart_sort_func } from "src/sort_utils";
import { successDarkColor } from "src/style_constants";

import {
  DropdownFilter,
  DisplayTableCopyCsv,
  DisplayTableDownloadCsv,
  DisplayTableColumnToggle,
  SelectPage,
  SelectPageSize,
} from "./DisplayTableUtils";

import text from "./DisplayTable.yaml";
import "./DisplayTable.scss";

const { text_maker, TM } = create_text_maker_component(text);

const _DisplayTablePropsDefaultProps = {
  page_size_increment: 100,
  enable_pagination: true,
  page_size_num_options_max: 5,
  unsorted_initial: true,
};
type _DisplayTableProps = typeof _DisplayTablePropsDefaultProps & {
  data: DisplayTableData[];
  column_configs: ColumnConfigs;
  unsorted_initial?: boolean;
  page_size_increment?: number;
  table_name?: string;
  util_components?: { [keys: string]: React.ReactElement };
  enable_pagination?: boolean;
  page_size_num_options_max?: number;
  disable_column_select?: boolean;
};

interface _DisplayTableState {
  page_size?: number;
  current_page: number;
  show_pagination_load_spinner: boolean;
  sort_by: string | null;
  descending: boolean;
  initial_props: _DisplayTableProps;
  visible_col_keys: string[];
  searches: { [keys: string]: string };
  filter_options_by_column: {
    [col_keys: string]: [FilterOption];
  };
}

interface DisplayTableData {
  [key: string]: CellValue;
}
interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

export type CellValue = string | number | undefined;

interface ColumnConfigs {
  [keys: string]: ColumnConfig;
}

const get_column_config_defaults = (index: number) => ({
  initial_visible: true,
  is_sortable: true,
  is_summable: false,
  is_searchable: false,
  sum_func: (sum: number, value: number) => sum + value,
  sum_initial_value: 0,
  visibility_toggleable: index !== 0,
  // "plain" value for some complex datasets actually requires processing, as we use "plain" formatted values in the output csv AND for searching and (by default) sorting
  plain_formatter: _.identity as (value: CellValue) => CellValue,
  sort_func: (
    plain_a: CellValue,
    plain_b: CellValue,
    descending: boolean,
    // available for any special cases that need access to the actual cell value, not the "plain" version usually used be sorting
    _cell_value_a: CellValue,
    _cell_value_b: CellValue
  ): 1 | 0 | -1 => smart_sort_func(plain_a, plain_b, descending),
});
type ColumnConfig = Partial<ReturnType<typeof get_column_config_defaults>> & {
  index: number;
  header: string;
  formatter: FormatKey | ((val: CellValue) => React.ReactNode);
};

const get_default_filter_options_by_column = _.memoize(
  (data: DisplayTableData[], col_configs_with_defaults: ColumnConfigs) =>
    _.chain(col_configs_with_defaults)
      .map((config, col_key) => ({ ...config, col_key }))
      .filter((config) => config.is_searchable as boolean)
      .map((config) => {
        const { col_key, plain_formatter, sort_func } = config as {
          col_key: string;
          plain_formatter: (value: CellValue) => CellValue;
          sort_func: (
            plain_a: CellValue,
            plain_b: CellValue,
            descending: boolean,
            cell_value_a: CellValue,
            cell_value_b: CellValue
          ) => 1 | 0 | -1;
        };
        return [
          col_key,
          _.chain(data)
            .map(col_key)
            .uniq()
            .sort((value_a: CellValue, value_b: CellValue) =>
              sort_func(
                plain_formatter(value_a),
                plain_formatter(value_b),
                true,
                value_a,
                value_b
              )
            )
            .map((col_data) => ({
              id: col_data,
              label: plain_formatter(col_data),
              active: true,
            }))
            .value(),
        ];
      })
      .fromPairs()
      .value(),
  (...args) => JSON.stringify(args)
);
const get_col_configs_with_defaults = (column_configs: ColumnConfigs) =>
  _.mapValues(column_configs, (supplied_column_config: ColumnConfig) => ({
    ...get_column_config_defaults(supplied_column_config.index),
    ...supplied_column_config,
  }));
const get_default_state_from_props = (props: _DisplayTableProps) => {
  const { unsorted_initial, column_configs, data } = props;

  const col_configs_with_defaults =
    get_col_configs_with_defaults(column_configs);

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
  const filter_options_by_column = get_default_filter_options_by_column(
    data,
    col_configs_with_defaults
  );

  return {
    visible_col_keys,
    sort_by,
    descending: false,
    searches,
    initial_props: props,
    page_size: props.page_size_increment,
    filter_options_by_column,
  };
};

/* Assumption: DisplayTable assumes 1st column to be string that describes its row
  - If total row exists, 1st column will have the word "Total"
  - 1st column cannot be toggled off by user
  - Total row color is set to $textLightColor, see total_color
*/
export class _DisplayTable extends React.Component<
  _DisplayTableProps,
  _DisplayTableState
> {
  private first_data_ref = React.createRef<HTMLTableCellElement>();

  static defaultProps = _DisplayTablePropsDefaultProps;

  constructor(props: _DisplayTableProps) {
    super(props);

    this.state = {
      ...get_default_state_from_props(props),
      current_page: 0,
      show_pagination_load_spinner: false,
    };
  }
  static getDerivedStateFromProps(
    nextProps: _DisplayTableProps,
    prevState: _DisplayTableState
  ) {
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

  change_page_size = (new_page_size: number) =>
    this.state.page_size !== new_page_size &&
    this.setState({
      show_pagination_load_spinner: true,
      page_size: new_page_size,
      current_page: 0,
    });

  change_page = (page: number) =>
    this.state.current_page !== page &&
    this.setState({
      show_pagination_load_spinner: true,
      current_page: page,
    });

  debounced_stop_loading = _.debounce(
    () => this.setState({ show_pagination_load_spinner: false }),
    1
  );

  componentDidUpdate() {
    const { show_pagination_load_spinner } = this.state;
    if (show_pagination_load_spinner) {
      // TODO: find a better work around than using debounce
      // Note on hacky implementation:
      /*
       * This debounce allows us to properly display a loading spinner when a user makes pagination changes to
       * the DisplayTable. We need the loading spinner because depending on how much data needs to be shown on
       * the table, it can take a couple seconds to load without any indication (bad user experience).
       * Without the debounce, the state update process occurs too quickly for the render process to actually
       * update the DOM meaning that without the artificial delay, a loading spinner does not really get rendered
       */
      this.debounced_stop_loading();
    }
  }

  componentWillUnmount() {
    this.debounced_stop_loading.cancel();
  }

  sortCol(column_key: string, dir: boolean) {
    this.setState({
      sort_by: column_key,
      descending: dir,
      current_page: 0,
    });
  }

  render() {
    const {
      table_name,
      data,
      column_configs,
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
      show_pagination_load_spinner,
      filter_options_by_column,
    } = this.state;

    const col_configs_with_defaults =
      get_col_configs_with_defaults(column_configs);
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

    const determine_text_align = (row: DisplayTableData, col: string) => {
      const current_col_formatter = col_configs_with_defaults[col].formatter;
      const current_col_plain_formatter =
        col_configs_with_defaults[col].plain_formatter;
      return (_.isString(current_col_formatter) && _.isNumber(row[col])) ||
        _.isNumber(current_col_plain_formatter(row[col]))
        ? "right"
        : "left";
    };

    const clean_search_string = (search_string: CellValue) =>
      _.chain(search_string).deburr().toLower().trim().value();

    const sorted_filtered_data = _.chain(data)
      .filter((row) =>
        _.chain(row)
          .map((cell_value: CellValue, column_key) => {
            const col_config = col_configs_with_defaults[column_key];
            const cell_search_value = clean_search_string(
              col_config.plain_formatter(cell_value)
            );
            const filter_option_for_this_cell =
              col_config.is_searchable &&
              (_.find(filter_options_by_column[column_key], {
                id: cell_value,
              }) as FilterOption);
            return (
              (_.isEmpty(searches[column_key]) ||
                _.includes(
                  cell_search_value,
                  clean_search_string(searches[column_key])
                )) &&
              (!col_config.is_searchable ||
                (filter_option_for_this_cell &&
                  filter_option_for_this_cell.active))
            );
          })
          .every()
          .value()
      )
      .thru((unsorted_array) => {
        if (sort_by && _.has(col_configs_with_defaults, sort_by)) {
          const { sort_func, plain_formatter } =
            col_configs_with_defaults[sort_by];

          return _.map(unsorted_array).sort(
            (row_a: DisplayTableData, row_b: DisplayTableData) =>
              _.chain([row_a, row_b])
                .map((row) => row[sort_by])
                .thru(([value_a, value_b]) =>
                  sort_func(
                    plain_formatter(value_a),
                    plain_formatter(value_b),
                    descending,
                    value_a,
                    value_b
                  )
                )
                .value()
          );
        } else {
          return unsorted_array;
        }
      })
      .value();

    const total_row = _.reduce<DisplayTableData, { [key: string]: number }>(
      sorted_filtered_data,
      (totals, row: DisplayTableData) =>
        _.mapValues(totals, (total: number, col_key) =>
          col_configs_with_defaults[col_key].sum_func(
            total,
            row[col_key] as number
          )
        ),
      _.chain(col_configs_with_defaults)
        .toPairs()
        .filter(([_key, col]) => col.is_summable)
        .map(([key, col]) => [key, col.sum_initial_value])
        .fromPairs() //had to do this to/from pair hack because over type overriding to object key:boolean pairs
        .value()
    );
    const is_total_exist = !_.isEmpty(total_row);

    const all_ordered_col_keys = _.chain(col_configs_with_defaults)
      .map(({ index }, key) => [index, key])
      .sortBy(_.first)
      .map(_.last)
      .value() as string[];
    const visible_ordered_col_keys = _.intersection(
      all_ordered_col_keys,
      visible_col_keys
    );

    const csv_string = _.chain(visible_ordered_col_keys)
      .map((key: string) => col_configs_with_defaults[key].header)
      .thru((header_row) => [header_row])
      .concat(
        _.map(sorted_filtered_data, (row: DisplayTableData) =>
          _.map(visible_ordered_col_keys, (key: string) =>
            _.toString(col_configs_with_defaults[key].plain_formatter(row[key]))
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
              items={_.map(all_ordered_col_keys, (key: string) => ({
                id: key,
                label: col_configs_with_defaults[key].header,
                active: _.includes(visible_ordered_col_keys, key),
              }))}
              onClick={(clicked_key: string) => {
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

    const selectPageUtil = enable_pagination && (
      <SelectPageSize
        selected={page_size}
        on_select={this.change_page_size}
        page_size_increment={page_size_increment}
        num_items={_.size(sorted_filtered_data)}
        num_options_max={page_size_num_options_max}
      />
    );

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
        <div className={"display-table-utils"}>
          <div className={"display-table-container__utils"}>
            {util_components_with_defaults && (
              <button
                tabIndex={0}
                className={"skip-to-data"}
                onClick={() =>
                  this.first_data_ref.current &&
                  this.first_data_ref.current.focus()
                }
              >
                {text_maker("skip_to_data")}
              </button>
            )}
            {selectPageUtil}
          </div>
          <div className={"display-table-container__utils"}>
            {_.map(util_components_with_defaults)}
          </div>
        </div>
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
              {_.map(
                visible_ordered_col_keys,
                (column_key: string, row_index) => (
                  <th
                    key={row_index}
                    className={"text-center"}
                    aria-sort={
                      column_key === sort_by
                        ? !descending
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {col_configs_with_defaults[column_key].header}
                  </th>
                )
              )}
            </tr>
            {_.some(col_configs_with_defaults, "is_sortable") && (
              <tr className="table-header">
                {_.map(visible_ordered_col_keys, (column_key: string) => {
                  const sortable =
                    col_configs_with_defaults[column_key].is_sortable;
                  const searchable =
                    col_configs_with_defaults[column_key].is_searchable;
                  const is_dropdown_filter_applied =
                    _.reject(filter_options_by_column[column_key], "active")
                      .length > 0;

                  const current_search_input =
                    (searchable && searches[column_key]) || null;

                  return (
                    <td key={column_key} style={{ textAlign: "center" }}>
                      {sortable && (
                        <div>
                          <SortDirections
                            asc={!descending && sort_by === column_key}
                            desc={descending && sort_by === column_key}
                            onDirectionClick={(dir) =>
                              this.sortCol(column_key, dir)
                            }
                          />
                        </div>
                      )}
                      {searchable && (
                        <div
                          style={{
                            height: is_dropdown_filter_applied
                              ? "6rem"
                              : "4.5rem",
                            minWidth: "155px",
                          }}
                          className="input-bar"
                        >
                          <div style={{ display: "flex" }}>
                            <DebouncedTextInput
                              inputClassName={`form-control search input-sm input-unstyled`}
                              style={{ width: "100%" }}
                              placeHolder={text_maker("search_column")}
                              a11y_label={text_maker("search_column")}
                              defaultValue={current_search_input}
                              updateCallback={(search_value: string) => {
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
                            <DropdownFilter
                              column_key={column_key}
                              filter_options_by_column={
                                filter_options_by_column
                              }
                              column_searches={searches}
                              set_filter_options={(
                                filter_options_by_column: _DisplayTableState["filter_options_by_column"]
                              ) => this.setState({ filter_options_by_column })}
                            />
                          </div>
                          {is_dropdown_filter_applied && (
                            <div className="input-bar__filter-applied">
                              <IconCheckmark
                                width="1em"
                                height="1.3em"
                                color={successDarkColor}
                                alternate_color={false}
                              />
                              <TM k="filters_applied" />
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}
            {page_selector}
          </thead>
          {show_pagination_load_spinner && (
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
                  <LeafSpinner config_name="subroute" />
                </td>
              </tr>
            </tbody>
          )}
          {!show_pagination_load_spinner &&
            (sorted_filtered_data.length === 0 ? (
              <NoDataMessage />
            ) : (
              <tbody>
                {_.map(
                  paginated_data[current_page],
                  (row: DisplayTableData, row_index) => (
                    <tr key={row_index}>
                      {_.map(
                        visible_ordered_col_keys,
                        (col_key: string, col_index) => (
                          <td
                            style={{
                              fontSize: "14px",
                              textAlign: determine_text_align(row, col_key),
                            }}
                            key={col_key}
                            tabIndex={-1}
                            ref={
                              col_index === 0 && row_index === 0
                                ? this.first_data_ref
                                : null
                            }
                          >
                            {(() => {
                              const col_formatter =
                                col_configs_with_defaults[col_key].formatter;
                              if (col_formatter) {
                                if (_.isString(col_formatter)) {
                                  return (
                                    <Format
                                      type={col_formatter}
                                      content={row[col_key]}
                                    />
                                  );
                                } else if (_.isFunction(col_formatter)) {
                                  return col_formatter(row[col_key]);
                                }
                              } else {
                                return row[col_key];
                              }
                            })()}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
                {is_total_exist && (
                  <tr key="total_row" className="total-row">
                    <td className="total_color">{text_maker("total")}</td>
                    {_.chain(visible_ordered_col_keys)
                      .tail()
                      .map((col_key: string) => (
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
                              const col_formatter =
                                col_configs_with_defaults[col_key].formatter;
                              if (col_formatter) {
                                if (_.isString(col_formatter)) {
                                  return (
                                    <Format
                                      type={col_formatter}
                                      content={total_row[col_key]}
                                    />
                                  );
                                } else if (_.isFunction(col_formatter)) {
                                  return col_formatter(total_row[col_key]);
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
      </div>
    );
  }
}

interface DisplayTableProps extends _DisplayTableProps {
  show_search?: boolean;
  show_sort?: boolean;
}

// Wrapper component that picks column configs based on the size of data. Currently cannot pick table utils
export class DisplayTable extends React.Component<DisplayTableProps> {
  render() {
    const { data, show_search, show_sort, column_configs } = this.props;
    const col_configs_with_defaults =
      get_col_configs_with_defaults(column_configs);

    const showing_sort = !_.isUndefined(show_sort)
      ? show_sort
      : _.size(data) >= 2;
    const showing_search = !_.isUndefined(show_search)
      ? show_search
      : _.size(data) > 5;

    const smart_column_configs = _.mapValues(
      col_configs_with_defaults,
      (supplied_column_config) => ({
        ...supplied_column_config,
        is_searchable: supplied_column_config.is_searchable && showing_search,
        is_sortable: supplied_column_config.is_sortable && showing_sort,
      })
    );
    if (this.props.page_size_increment == undefined) {
      return (
        <_DisplayTable
          {...this.props}
          column_configs={smart_column_configs}
          enable_pagination={
            _.size(data) > _DisplayTable.defaultProps.page_size_increment
          }
        />
      );
    } else {
      return (
        <_DisplayTable
          {...this.props}
          column_configs={smart_column_configs}
          enable_pagination={_.size(data) > this.props.page_size_increment}
        />
      );
    }
  }
}
