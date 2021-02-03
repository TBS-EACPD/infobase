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
      may_show_menu: false,
      pagination_index: 0,
      selected_index: -1,
      matching_results_by_page: [],
    };
  }
  componentDidMount() {
    document.body.addEventListener("click", this.handle_window_click);
  }
  componentWillUnmount() {
    document.body.removeEventListener("click", this.handle_window_click);
    this.debounced_on_query.cancel();
  }
  componentDidUpdate(prevProps, prevState) {
    const { search_configs, pagination_size } = this.props;
    const { search_configs: prev_search_configs } = prevProps;
    const { query_value } = this.state;
    const { query_value: prev_query_value } = prevState;

    if (
      query_value !== prev_query_value ||
      search_configs !== prev_search_configs
    ) {
      const matching_results_by_page = !this.show_menu
        ? []
        : _.chain(this.all_options)
            .filter((option) => {
              const { config_group_index, data } = option;

              const group_filter = this.config_groups[config_group_index]
                ?.group_filter;

              return group_filter(query_value, data);
            })
            .chunk(pagination_size)
            .value();

      this.setState({
        matching_results_by_page,
        pagination_index: 0,
        selected_index: -1,
      });
    } else {
      this.active_item?.scrollIntoView({
        behaviour: "auto",
        block: "nearest",
      });
    }
  }
  render() {
    const {
      placeholder,
      min_length,
      pagination_size,
      utility_buttons,
    } = this.props;

    const { query_value, selected_index } = this.state;

    const derived_menu_state = this.derived_menu_state;
    const {
      results_on_page,
      total_matching_results,
      page_range_start,
      page_range_end,
      next_page_size,
      needs_pagination_up_control,
      needs_pagination_down_control,
      pagination_down_item_index,
    } = derived_menu_state;

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
            aria-expanded={this.show_menu}
            aria-label={text_maker("num_chars_needed", { min_length })}
            placeholder={placeholder}
            value={query_value}
            onFocus={this.handle_input_focus}
            onChange={this.handle_input_change}
            onKeyDown={this.handle_key_down}
          />
          {utility_buttons}
        </div>
        {this.show_menu && (
          <TypeaheadA11yStatus
            {...{ ...this.props, ...this.state, ...this.derived_menu_state }}
          />
        )}
        {this.show_menu && (
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
                      0 === selected_index && "typeahead__item--active"
                    )}
                    aria-selected={0 === selected_index}
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
                                  index === selected_index &&
                                    "typeahead__item--active"
                                )}
                                aria-selected={index === selected_index}
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
                      pagination_down_item_index === selected_index &&
                        "typeahead__item--active"
                    )}
                    aria-selected={
                      pagination_down_item_index === selected_index
                    }
                    onClick={() => {
                      this.setState((prev_state) => ({
                        pagination_index: prev_state.pagination_index + 1,
                        selected_index: next_page_size + 1,
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

  get show_menu() {
    const { min_length } = this.props;
    const { may_show_menu, query_value } = this.state;

    return may_show_menu && query_value.length >= min_length;
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

  get derived_menu_state() {
    const { pagination_size } = this.props;
    const { pagination_index, matching_results_by_page } = this.state;

    const total_matching_results = _.flatten(matching_results_by_page).length;

    const results_on_page = matching_results_by_page[pagination_index] || [];

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

    const pagination_down_item_index = needs_pagination_up_control
      ? results_on_page.length + 1
      : results_on_page.length;

    return {
      results_on_page,
      total_matching_results,
      page_range_start,
      page_range_end,
      next_page_size,
      needs_pagination_up_control,
      needs_pagination_down_control,
      pagination_down_item_index,
    };
  }

  handle_window_click = (e) => {
    if (!this.typeahead_ref.current.contains(e.target)) {
      this.setState({ may_show_menu: false });
    }
  };

  handle_input_focus = () => this.setState({ may_show_menu: true });

  debounced_on_query = _.debounce((query_value) => {
    this.props.on_query(query_value);

    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${query_value}, search_configs: ${_.map(
        this.props.search_configs,
        "config_name"
      )}`,
    });
  }, 400);
  handle_input_change = (event) => {
    const trimmed_input_value = _.trimStart(event.target.value);

    this.debounced_on_query(trimmed_input_value);

    this.setState({
      query_value: trimmed_input_value,
    });
  };

  handle_up_arrow = (e) => {
    e.preventDefault();
    const { selected_index } = this.state;
    if (this.show_menu && selected_index > -1) {
      this.setState({ selected_index: selected_index - 1 });
    }
  };
  handle_down_arrow = (e) => {
    e.preventDefault();
    const {
      selected_index,
      pagination_index,
      matching_results_by_page,
    } = this.state;

    const {
      needs_pagination_up_control,
      needs_pagination_down_control,
    } = this.derived_menu_state;

    const num_menu_items =
      matching_results_by_page[pagination_index].length +
      needs_pagination_up_control +
      needs_pagination_down_control;

    if (this.show_menu && selected_index < num_menu_items - 1) {
      this.setState({ selected_index: selected_index + 1 });
    }
  };
  handle_enter_key = (e) => {
    const { selected_index } = this.state;
    if (this.show_menu) {
      e.preventDefault();

      if (selected_index === -1) {
        this.setState({ selected_index: 0 });
      } else {
        this.active_item?.click();
      }
    }
  };
  handle_key_down = (e) => {
    switch (e.keyCode) {
      case 38: //up arrow
        this.handle_up_arrow(e);
        break;
      case 40: //down arrow
        this.handle_down_arrow(e);
        break;
      case 13: //enter key
        this.handle_enter_key(e);
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
        selected_index: -1,
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
