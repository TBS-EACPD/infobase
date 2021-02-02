import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

import { get_static_url } from "src/request_utils.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import { Status } from "./Status.js";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class Typeahead extends React.Component {
  menu_item_references = {};

  constructor(props) {
    super(props);

    this.typeahead_ref = React.createRef();

    this.menuId = _.uniqueId("typeahead-");

    this.state = {
      query_value: "",
      pagination_index: 0,
      current_selected_index: -1,
      input_has_focus: false,
    };
  }
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
  componentWillUnmount() {
    this.debounced_on_query.cancel();
  }
  render() {
    const {
      placeholder,
      min_length,
      pagination_size,
      search_configs,
      utility_buttons,
    } = this.props;

    const {
      query_value,
      pagination_index,
      current_selected_index,
      input_has_focus,
    } = this.state;

    const config_groups = _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }));

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
      const { query_value } = this.state;

      const group_filter =
        config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(query_value, option.data);

      return query_matches;
    };

    const queried_results = _.filter(all_options, (res) => matches_query(res));

    const show_menu = input_has_focus && query_value.length >= min_length;

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
      query_length: query_value.length,
      input_has_focus,
      needs_pagination_up_control,
      needs_pagination_down_control,
      pagination_size,
      next_page_size,
      paginated_results,
    };

    const pagination_down_item_index = needs_pagination_up_control
      ? paginated_results.length + 1
      : paginated_results.length;

    return (
      <div ref={this.typeahead_ref} className="typeahead">
        <div className="typeahead__search-bar">
          <div className="typeahead__icon-container">
            <span aria-hidden="true">
              <img
                src={`${get_static_url("svg/search.svg")}`}
                style={{ width: "30px", height: "30px" }}
              />
            </span>
          </div>
          <input
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-owns={this.menuId}
            aria-expanded={show_menu}
            placeholder={placeholder}
            value={query_value}
            onChange={this.handle_input_change}
            onFocus={this.handle_input_focus}
            onBlur={this.handle_input_blur}
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
          {utility_buttons}
        </div>
        <Status {...status_props} />
        {show_menu && (
          <ul className="typeahead__dropdown" role="listbox" id={this.menuId}>
            {_.isEmpty(paginated_results) && (
              <li className="typeahead__header">
                {text_maker("no_matches_found")}
              </li>
            )}
            {!_.isEmpty(paginated_results) && (
              <Fragment>
                <li className="typeahead__header">
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
                    className={classNames(
                      "typeahead__item",
                      0 === current_selected_index && "typeahead__item--active"
                    )}
                    aria-selected={0 === current_selected_index}
                    ref={(ref) => {
                      this.menu_item_references[0] = ref;
                    }}
                    onClick={(e) => {
                      this.setState((prev_state) => ({
                        pagination_index: prev_state.pagination_index - 1,
                      }));
                    }}
                  >
                    <a className="typeahead__control">
                      <span className="aria-hidden">▲</span>
                      <br />
                      <TM
                        k="paginate_previous"
                        args={{ page_size: pagination_size }}
                      />
                    </a>
                  </li>
                )}
                {_.chain(paginated_results)
                  .groupBy("config_group_index")
                  .thru((grouped_results) => {
                    let index_key_counter = needs_pagination_up_control ? 1 : 0;
                    return _.flatMap(
                      grouped_results,
                      (results, group_index) => (
                        <Fragment key={`header-${group_index}`}>
                          <li className="typeahead__header">
                            {config_groups[group_index].group_header}
                          </li>
                          {_.map(results, (result) => {
                            const index = index_key_counter++;
                            return (
                              <li
                                key={`result-${index}`}
                                className={classNames(
                                  "typeahead__item",
                                  index === current_selected_index &&
                                    "typeahead__item--active"
                                )}
                                aria-selected={index === current_selected_index}
                                ref={(ref) => {
                                  this.menu_item_references[index] = ref;
                                }}
                                onClick={() =>
                                  this.handle_result_selection(result)
                                }
                              >
                                <a className="typeahead__match">
                                  {result.menu_content(query_value)}
                                </a>
                              </li>
                            );
                          })}
                        </Fragment>
                      )
                    );
                  })
                  .value()}
                {needs_pagination_down_control && (
                  <li
                    className={classNames(
                      "typeahead__item",
                      pagination_down_item_index === current_selected_index &&
                        "typeahead__item--active"
                    )}
                    aria-selected={
                      pagination_down_item_index === current_selected_index
                    }
                    ref={(ref) => {
                      this.menu_item_references[
                        pagination_down_item_index
                      ] = ref;
                    }}
                    onClick={(e) => {
                      this.setState((prev_state) => ({
                        pagination_index: prev_state.pagination_index + 1,
                        current_selected_index: next_page_size + 1,
                      }));
                    }}
                  >
                    <a className="typeahead__control">
                      <TM
                        k="paginate_next"
                        args={{ next_page_size: next_page_size }}
                      />
                      <br />
                      <span className="aria-hidden">▼</span>
                    </a>
                  </li>
                )}
              </Fragment>
            )}
          </ul>
        )}
      </div>
    );
  }

  handle_result_selection = (selected) => {
    const { on_select } = this.props;
    const { query_value } = this.state;

    const anything_selected = !_.isEmpty(selected);
    if (anything_selected) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: `TYPEAHEAD_SEARCH_SELECT`,
        MISC2: `Queried: ${query_value}. Selected: ${selected.name}`,
      });

      this.setState({
        query_value: "",
        pagination_index: 0,
        current_selected_index: -1,
      });
      if (_.isFunction(on_select)) {
        on_select(selected.data);
      }
    }
  };

  handle_input_focus = () => this.setState({ input_has_focus: true });
  handle_input_blur = () => this.setState({ input_has_focus: false });

  handle_up_arrow = (e, show_menu) => {
    e.preventDefault();
    const { current_selected_index } = this.state;
    if (show_menu && current_selected_index > -1) {
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
    if (show_menu && current_selected_index < num_menu_items - 1) {
      this.setState({ current_selected_index: current_selected_index + 1 });
    }
  };
  handle_enter_key = (e, show_menu) => {
    if (show_menu) {
      e.preventDefault();
      const { current_selected_index } = this.state;
      if (current_selected_index === -1) {
        this.setState({ current_selected_index: 0 });
      } else {
        this.menu_item_references[current_selected_index].click();
      }
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

  debounced_on_query = _.debounce((query) => {
    this.props.on_query();

    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${query}, search_configs: ${_.map(
        this.props.search_configs,
        "config_name"
      )}`,
    });
  }, 500);
  handle_input_change = (event) => {
    const trimmed_input_value = _.trimStart(event.target.value); //prevent empty searching that will show all results

    this.debounced_on_query(trimmed_input_value);

    this.setState({
      query_value: trimmed_input_value,
      pagination_index: 0,
      current_selected_index: -1,
    });
  };
}

Typeahead.defaultProps = {
  placeholder: text_maker("org_search"),
  min_length: 3,
  on_query: _.noop,
  on_select: _.noop,
};
