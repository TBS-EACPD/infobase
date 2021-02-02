import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

import { get_static_url } from "src/request_utils.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import { TypeaheadA11yStatus } from "./TypeaheadA11yStatus.js";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class Typeahead extends React.Component {
  constructor(props) {
    super(props);

    this.typeahead_ref = React.createRef();

    this.menuId = _.uniqueId("typeahead-");

    this.state = {
      query_value: "",
      pagination_index: 0,
      current_selected_index: -1,
      may_show_menu: false,
    };
  }
  componentDidUpdate(prev_props, prev_state) {
    const { current_selected_index } = this.state;
    if (
      current_selected_index !== prev_state.current_selected_index &&
      current_selected_index !== -1
    ) {
      this.active_item?.scrollIntoView({
        behaviour: "auto",
        block: "nearest",
      });
    }
  }
  componentDidMount() {
    document.body.addEventListener("click", this.handle_window_click);
  }
  componentWillUnmount() {
    document.body.removeEventListener("click", this.handle_window_click);
    this.debounced_on_query.cancel();
  }
  render() {
    const {
      placeholder,
      min_length,
      pagination_size,
      utility_buttons,
    } = this.props;

    const {
      query_value,
      pagination_index,
      current_selected_index,
      may_show_menu,
    } = this.state;

    const is_query_of_min_length = query_value.length >= min_length;

    const show_menu = is_query_of_min_length && may_show_menu;

    const matching_results = is_query_of_min_length
      ? this.get_all_matching_results()
      : [];
    const total_matching_results = matching_results.length;

    const results_on_page = this.get_results_on_page(matching_results);

    const page_range_start = pagination_index * pagination_size + 1;
    const page_range_end = page_range_start + results_on_page.length - 1;

    const remaining_results =
      (pagination_index + 1) * pagination_size < total_matching_results
        ? total_matching_results - (pagination_index + 1) * pagination_size
        : 0;

    const next_page_size =
      remaining_results < pagination_size ? remaining_results : pagination_size;

    const needs_pagination_up_control = pagination_index > 0;
    const needs_pagination_down_control =
      page_range_end < total_matching_results;

    const status_props = {
      current_selected_name: results_on_page[current_selected_index]?.name,
      current_selected_index,
      pagination_size,
      total_matching_results,
      page_range_start,
      page_range_end,
      current_page_size: _.size(results_on_page),
      next_page_size,
      needs_pagination_up_control,
      needs_pagination_down_control,
    };

    const pagination_down_item_index = needs_pagination_up_control
      ? results_on_page.length + 1
      : results_on_page.length;

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
            aria-label={text_maker("num_chars_needed", { min_length })}
            placeholder={placeholder}
            value={query_value}
            onFocus={this.handle_input_focus}
            onChange={this.handle_input_change}
            onKeyDown={(e) =>
              this.handle_key_down(
                e,
                show_menu,
                results_on_page,
                needs_pagination_up_control,
                needs_pagination_down_control
              )
            }
          />
          {utility_buttons}
        </div>
        {show_menu && <TypeaheadA11yStatus {...status_props} />}
        {show_menu && (
          <ul className="typeahead__dropdown" role="listbox" id={this.menuId}>
            {_.isEmpty(results_on_page) && (
              <li className="typeahead__header">
                {text_maker("no_matches_found")}
              </li>
            )}
            {!_.isEmpty(results_on_page) && (
              <Fragment>
                {needs_pagination_up_control && (
                  <li
                    className={classNames(
                      "typeahead__item",
                      0 === current_selected_index && "typeahead__item--active"
                    )}
                    aria-selected={0 === current_selected_index}
                    onClick={(e) => {
                      e.preventDefault();
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
                {_.chain(results_on_page)
                  .groupBy("config_group_index")
                  .thru((grouped_results) => {
                    let index_key_counter = needs_pagination_up_control ? 1 : 0;
                    return _.flatMap(
                      grouped_results,
                      (results, group_index) => (
                        <Fragment key={`header-${group_index}`}>
                          <li className="typeahead__header">
                            {this.config_groups[group_index].group_header}
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
                                onClick={() =>
                                  this.handle_result_selection(result)
                                }
                              >
                                <a className="typeahead__result">
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
                    onClick={() => {
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

  get active_item() {
    return this.typeahead_ref.current.querySelector(".typeahead__item--active");
  }

  get_config_groups = _.memoize((search_configs) =>
    _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }))
  );
  get config_groups() {
    return this.get_config_groups(this.props.search_configs);
  }

  get_all_options = _.memoize((search_configs) =>
    _.flatMap(search_configs, (search_config, ix) =>
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
    )
  );
  get all_options() {
    return this.get_all_options(this.props.search_configs);
  }

  matches_query = (option) => {
    const { query_value } = this.state;

    const { config_group_index, data } = option;

    const group_filter = this.config_groups[config_group_index]?.group_filter;

    return group_filter(query_value, data);
  };
  get_all_matching_results = () =>
    _.filter(this.all_options, this.matches_query);

  get_results_on_page = (matching_results) =>
    _.filter(matching_results, (_result, index) => {
      const { pagination_size } = this.props;
      const { pagination_index } = this.state;

      const page_start = pagination_size * pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(index < page_start || index >= page_end);

      return is_on_displayed_page;
    });

  handle_window_click = (e) => {
    if (!this.typeahead_ref.current.contains(e.target)) {
      this.setState({ may_show_menu: false });
    }
  };

  handle_input_focus = () => this.setState({ may_show_menu: true });

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
    results_on_page,
    needs_pagination_up_control,
    needs_pagination_down_control
  ) => {
    e.preventDefault();
    const { current_selected_index } = this.state;
    const num_menu_items =
      results_on_page.length +
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
        this.active_item?.click();
      }
    }
  };
  handle_key_down = (
    e,
    show_menu,
    results_on_page,
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
          results_on_page,
          needs_pagination_up_control,
          needs_pagination_down_control
        );
        break;
      case 13: //enter key
        this.handle_enter_key(e, show_menu);
        break;
    }
  };

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
}

Typeahead.defaultProps = {
  placeholder: text_maker("org_search"),
  min_length: 3,
  on_query: _.noop,
  on_select: _.noop,
};
