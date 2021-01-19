import _ from "lodash";
import { React, Fragment } from "react";
import MediaQuery from "react-responsive";

import {
  DropdownMenu,
  create_text_maker_component,
} from "src/components/index.js";

import { log_standard_event } from "../../core/analytics.js";
import { breakpoints } from "../../core/breakpoint_defs.js";

import { IconFilter } from "../../icons/icons.js";

import { get_static_url } from "../../request_utils.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import { Status } from "./Status.js";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class Typeahead extends React.Component {
  state = {
    search_text: "",
    can_show_menu: false,
    current_selected_index: -1,
    pagination_index: 0,
    input_is_in_focus: false,
  };

  constructor(props) {
    super(props);

    this.typeaheadRef = React.createRef();
    this.rbtRef = React.createRef();

    this.menuId = _.uniqueId("rbt_menu_id_");
  }

  menu_item_references = {};

  on_select_item = (selected) => {
    const { onSelect } = this.props;

    const anything_selected = !_.isEmpty(selected);
    if (anything_selected) {
      this.setState({
        search_text: "",
        pagination_index: 0,
        current_selected_index: -1,
      });

      if (_.isFunction(onSelect)) {
        onSelect(selected.data);
      }

      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: `TYPEAHEAD_SEARCH_SELECT`,
        MISC2: `selected: ${selected.name}`,
      });
    }
  };

  handle_up_arrow = (e, show_menu) => {
    e.preventDefault();
    const { current_selected_index } = this.state;
    if (show_menu && current_selected_index !== -1) {
      this.setState({ current_selected_index: current_selected_index - 1 });
    }
  };

  handle_down_arrow = (
    e,
    show_menu,
    paginated_results,
    needs_pagination_up_control,
    needs_pagination_down_control
  ) => {
    e.preventDefault();
    const { current_selected_index } = this.state;
    const num_menu_items =
      paginated_results.length +
      needs_pagination_up_control +
      needs_pagination_down_control;
    if (show_menu && current_selected_index !== num_menu_items) {
      this.setState({ current_selected_index: current_selected_index + 1 });
    }
  };

  handle_enter_key = (e, show_menu) => {
    if (show_menu) {
      e.preventDefault();
      const { current_selected_index } = this.state;
      current_selected_index >= 0 &&
        this.menu_item_references[current_selected_index].click();
    }
  };

  handle_key_down = (
    e,
    show_menu,
    paginated_results,
    needs_pagination_up_control,
    needs_pagination_down_control
  ) => {
    switch (e.keyCode) {
      case 38: //up arrow
        this.handle_up_arrow(e, show_menu);
        break;
      case 40: //down arrow
        this.handle_down_arrow(
          e,
          show_menu,
          paginated_results,
          needs_pagination_up_control,
          needs_pagination_down_control
        );
        break;
      case 13: //enter key
        this.handle_enter_key(e, show_menu);
        break;
    }
  };

  hide_menu = () => this.setState({ can_show_menu: false });

  handle_window_click = (e) => {
    if (!this.rbtRef.current.contains(e.target)) {
      this.hide_menu();
    }
  };

  componentDidUpdate(prev_props, prev_state) {
    const { current_selected_index } = this.state;
    if (
      current_selected_index !== prev_state.current_selected_index &&
      current_selected_index !== -1
    ) {
      this.menu_item_references[current_selected_index].focus();
      this.menu_item_references[
        current_selected_index
      ].scrollIntoViewIfNeeded();
    }
  }

  componentDidMount() {
    document.body.addEventListener("click", this.handle_window_click);
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handle_window_click);
  }

  render() {
    const {
      placeholder,
      min_length,
      filter_content,
      pagination_size,
      search_configs,
      onNewQuery,
      is_original_filter,
    } = this.props;

    const {
      search_text,
      can_show_menu,
      pagination_index,
      current_selected_index,
      input_is_in_focus,
    } = this.state;

    const debounceOnNewQuery = _.debounce((query) => {
      onNewQuery();
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: `TYPEAHEAD_SEARCH_QUERY`,
        MISC2: `query: ${query}, search_configs: ${_.map(
          search_configs,
          "config_name"
        )}`,
      });
    }, 500);

    const update_search_text = (event) => {
      const text = _.trimStart(event.target.value); //prevent empty searching that will show all results
      debounceOnNewQuery(text);
      this.setState({
        search_text: text,
        pagination_index: 0,
        current_selected_index: -1,
      });
    };

    const config_groups = _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }));

    // Options includes placeholders for pagination items, because the number of results passed to renderMenu
    // (ie. that get through matches_query) needs to actually match the number of lis ultimately rendered, can't
    // just insert the pagination items when renderMenu is called
    const all_options = [
      ..._.flatMap(search_configs, (search_config, ix) =>
        _.map(search_config.get_data(), (data) => ({
          data,
          name: search_config.name_function(data),
          menu_content: (search) =>
            _.isFunction(search_config.menu_content_function) ? (
              search_config.menu_content_function(data, search)
            ) : (
              <InfoBaseHighlighter
                search={search}
                content={search_config.name_function(data)}
              />
            ),
          config_group_index: ix,
        }))
      ),
    ];

    const matches_query = (option) => {
      const { search_text } = this.state;

      const group_filter =
        config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(search_text, option.data);

      return query_matches;
    };

    const queried_results = _.filter(all_options, (res) => matches_query(res));

    const show_menu = search_text.length >= min_length && can_show_menu;

    const paginate_results = (option, index) => {
      const page_start = pagination_size * pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(index < page_start || index >= page_end);

      return is_on_displayed_page;
    };

    const paginated_results = _.filter(
      queried_results,
      (queried_result, index) => paginate_results(queried_result, index)
    );

    const page_range_start = pagination_index * pagination_size + 1;
    const page_range_end = page_range_start + paginated_results.length - 1;

    const total_matching_results = queried_results.length;

    const remaining_results =
      total_matching_results - (pagination_index + 1) * pagination_size;
    const next_page_size =
      remaining_results < pagination_size ? remaining_results : pagination_size;

    const needs_pagination_up_control = pagination_index > 0;
    const needs_pagination_down_control =
      page_range_end < total_matching_results;

    const status_props = {
      current_selected:
        paginated_results[current_selected_index] &&
        paginated_results[current_selected_index].name,
      current_selected_index,
      min_length,
      total_matching_results,
      page_range_start,
      page_range_end,
      query_length: search_text.length,
      input_is_in_focus,
      needs_pagination_up_control,
      needs_pagination_down_control,
      pagination_size,
      next_page_size,
      paginated_results,
    };

    return (
      <div className="rbt" style={{ position: "relative" }} ref={this.rbtRef}>
        <div className="search-bar">
          <div className="search-icon-container">
            <span aria-hidden="true">
              <img
                src={`${get_static_url("svg/search.svg")}`}
                style={{ width: "30px", height: "30px" }}
              />
            </span>
          </div>
          <input
            id="rbt-search"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-owns={this.menuId}
            aria-expanded={show_menu}
            style={{ width: "100%" }}
            placeholder={placeholder}
            onChange={update_search_text}
            ref={this.typeaheadRef}
            value={
              current_selected_index === -1
                ? search_text
                : paginated_results[current_selected_index].name
            }
            onFocus={() =>
              this.setState({ can_show_menu: true, input_is_in_focus: true })
            }
            onBlur={() => this.setState({ input_is_in_focus: false })}
            onKeyDown={(e) =>
              this.handle_key_down(
                e,
                show_menu,
                paginated_results,
                needs_pagination_up_control,
                needs_pagination_down_control
              )
            }
          />

          {filter_content && (
            <DropdownMenu
              dropdown_trigger_txt={
                <div
                  style={{
                    textAlign: "start",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  <MediaQuery minWidth={breakpoints.minSmallDevice}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        marginRight: "1.5rem",
                      }}
                    >
                      <IconFilter
                        height="5px"
                        width="5px"
                        vertical_align="top"
                        alternate_color="false"
                      />
                    </div>
                  </MediaQuery>
                  <span>
                    {is_original_filter
                      ? text_maker("add_filter")
                      : text_maker("edit_filter")}
                  </span>
                </div>
              }
              dropdown_a11y_txt={
                is_original_filter
                  ? text_maker("add_filter")
                  : text_maker("edit_filter")
              }
              opened_button_class_name={"btn-ib-light--reversed--with-icon"}
              closed_button_class_name={"btn-ib-light--with-icon"}
              dropdown_content_class_name="no-right"
              dropdown_content={filter_content}
            />
          )}
        </div>
        <Fragment>
          <Status {...status_props} />
          {show_menu &&
            (() => {
              if (_.isEmpty(paginated_results)) {
                return (
                  <ul
                    className="rbt-menu dropdown-menu show"
                    id={this.menuId}
                    role="listbox"
                  >
                    <li className="dropdown-header">
                      {text_maker("no_matches_found")}
                    </li>
                  </ul>
                );
              } else {
                return (
                  <ul
                    className="rbt-menu dropdown-menu show"
                    id={this.menuId}
                    role="listbox"
                  >
                    {_.chain(paginated_results)
                      .groupBy("config_group_index")
                      .thru((grouped_results) => {
                        const pagination_down_item_index = needs_pagination_up_control
                          ? paginated_results.length + 1
                          : paginated_results.length;

                        let index_key_counter = needs_pagination_up_control
                          ? 1
                          : 0;
                        return (
                          <Fragment>
                            <li
                              key={`header-pagination-info`}
                              className="dropdown-header"
                            >
                              <TM
                                k="paginate_status"
                                args={{
                                  page_range_start,
                                  page_range_end,
                                  total_matching_results,
                                }}
                              />
                            </li>
                            {needs_pagination_up_control && (
                              <li
                                className={`${
                                  0 === current_selected_index && "active"
                                }`}
                                aria-selected={0 === current_selected_index}
                                ref={(ref) => {
                                  this.menu_item_references[0] = ref;
                                }}
                                onClick={(e) => {
                                  this.setState((prev_state) => ({
                                    pagination_index:
                                      prev_state.pagination_index - 1,
                                  }));
                                }}
                              >
                                <a
                                  key="rbt-menu-item-0"
                                  id="rbt-menu-item-0"
                                  className="rbt-menu-pagination-option dropdown-item "
                                >
                                  <span className="aria-hidden">▲</span>
                                  <br />
                                  <TM
                                    k="paginate_previous"
                                    args={{ page_size: pagination_size }}
                                  />
                                </a>
                              </li>
                            )}

                            {_.flatMap(
                              grouped_results,
                              (results, group_index) => (
                                <Fragment key={`header-${group_index}`}>
                                  <li className="dropdown-header">
                                    {config_groups[group_index].group_header}
                                  </li>
                                  {_.map(results, (result) => {
                                    const index = index_key_counter++;
                                    return (
                                      <li
                                        key={`rbt-menu-item-${index}`}
                                        className={`${
                                          index === current_selected_index &&
                                          "active"
                                        }`}
                                        aria-selected={
                                          index === current_selected_index
                                        }
                                        ref={(ref) => {
                                          this.menu_item_references[
                                            index
                                          ] = ref;
                                        }}
                                        onClick={() =>
                                          this.on_select_item(result)
                                        }
                                      >
                                        <a
                                          id={`rbt-menu-item-${index}`}
                                          className="dropdown-item list-group-ite"
                                        >
                                          {result.menu_content(search_text)}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </Fragment>
                              )
                            )}
                            {needs_pagination_down_control && (
                              <li
                                className={`${
                                  pagination_down_item_index ===
                                    current_selected_index && "active"
                                }`}
                                aria-selected={
                                  pagination_down_item_index ===
                                  current_selected_index
                                }
                                ref={(ref) => {
                                  this.menu_item_references[
                                    pagination_down_item_index
                                  ] = ref;
                                }}
                                onClick={(e) => {
                                  this.setState((prev_state) => ({
                                    pagination_index:
                                      prev_state.pagination_index + 1,
                                    current_selected_index: next_page_size + 1,
                                  }));
                                }}
                              >
                                <a
                                  key={`rbt-menu-item-${pagination_down_item_index}`}
                                  id={`rbt-menu-item-${pagination_down_item_index}`}
                                  className="rbt-menu-pagination-option dropdown-item "
                                >
                                  <TM
                                    k="paginate_next"
                                    args={{ next_page_size: next_page_size }}
                                  />
                                  <br />
                                  <span className="aria-hidden">▼</span>
                                </a>
                              </li>
                            )}
                            <li
                              className={`${
                                pagination_down_item_index +
                                  needs_pagination_down_control ===
                                  current_selected_index && "active"
                              }`}
                              aria-selected={
                                pagination_down_item_index +
                                  needs_pagination_down_control ===
                                current_selected_index
                              }
                              ref={(ref) => {
                                this.menu_item_references[
                                  pagination_down_item_index +
                                    needs_pagination_down_control
                                ] = ref;
                              }}
                              onClick={() => this.hide_menu()}
                            >
                              <a
                                key={`rbt-menu-item-${
                                  pagination_down_item_index + 1
                                }`}
                                id={`rbt-menu-item-${
                                  pagination_down_item_index + 1
                                }`}
                                className="rbt-menu-close-menu-button dropdown-item"
                              >
                                {text_maker("close_menu")}
                              </a>
                            </li>
                          </Fragment>
                        );
                      })
                      .value()}
                  </ul>
                );
              }
            })()}
        </Fragment>
      </div>
    );
  }
}

Typeahead.defaultProps = {
  placeholder: text_maker("org_search"),
  min_length: 3,
  onNewQuery: _.noop,
};
