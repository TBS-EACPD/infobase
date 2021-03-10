import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import ReactResizeDetector from "react-resize-detector";

import { AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";

import { AutoHeightVirtualList } from "src/components/AutoHeightVirtualList.js";
import { create_text_maker_component } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

import { IconSearch } from "src/icons/icons.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import { TypeaheadA11yStatus } from "./TypeaheadA11yStatus.js";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker, TM } = create_text_maker_component(text);

const virtualized_cell_measure_cache = new CellMeasurerCache({
  fixedWidth: true,
});

export class Typeahead extends React.Component {
  constructor(props) {
    super(props);

    this.typeahead_ref = React.createRef();
    this.virtualized_list_ref = React.createRef();

    this.menu_id = _.uniqueId("typeahead-");

    this.state = {
      query_value: "",
      may_show_menu: false,
      matching_results: [],
      selection_cursor: this.default_selection_cursor,
      current_search_configs: props.search_configs,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { search_configs } = nextProps;
    const { current_search_configs } = prevState;

    if (search_configs !== current_search_configs) {
      return {
        matching_results: [],
        current_search_configs: search_configs,
      };
    } else {
      return null;
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      query_value,
      current_search_configs,
      selection_cursor,
    } = this.state;
    const {
      query_value: prev_query_value,
      current_search_configs: prev_search_configs,
      selection_cursor: prev_selection_cursor,
      matching_results: prev_matching_results,
    } = prevState;

    if (
      query_value !== prev_query_value ||
      current_search_configs !== prev_search_configs
    ) {
      const matching_results = !this.show_menu
        ? []
        : _.filter(this.all_options, ({ config_group_index, data }) =>
            // could use optional chaining, but we WANT this to fail fast and loud, to catch
            // malformed search_configs during development. Should be safe otherwsie
            this.config_groups[config_group_index].group_filter(
              query_value,
              data
            )
          );

      if (matching_results !== prev_matching_results) {
        virtualized_cell_measure_cache.clearAll();
      }

      this.setState({
        matching_results,
        selection_cursor: this.default_selection_cursor,
      });
    }

    if (this.virtualized_list_ref.current) {
      if (
        selection_cursor !== prev_selection_cursor &&
        prev_selection_cursor > selection_cursor
      ) {
        this.virtualized_list_ref.current.recomputeRowHeights(
          selection_cursor >= 0 ? selection_cursor : 0
        ); //scrolling up is choppy if we don't do this
      }
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
      additional_a11y_description,
      min_length,
      utility_buttons,
    } = this.props;

    const {
      query_value,
      selection_cursor,
      list_height,
      matching_results,
    } = this.state;

    const derived_menu_state = this.derived_menu_state;
    const { total_matching_results } = derived_menu_state;

    const list_items = _.compact([
      ..._.chain(matching_results)
        .groupBy("config_group_index")
        .flatMap((results, group_index) =>
          _.map(results, (result, index) => ({
            is_first_in_group: index === 0,
            group_index,
            result,
          }))
        )
        .flatMap(({ is_first_in_group, group_index, result }, result_index) => {
          return [
            <div key={`result-${result_index}`}>
              {result_index === 0 && (
                <div
                  key="header"
                  className="typeahead__header"
                  style={{ borderTop: "none" }}
                >
                  <TM
                    k="menu_with_results_status"
                    args={{
                      total_matching_results,
                    }}
                  />
                </div>
              )}
              {is_first_in_group && (
                <div className="typeahead__header" key={`group-${group_index}`}>
                  {this.config_groups[group_index].group_header}
                </div>
              )}
              <div
                className={classNames(
                  "typeahead__item",
                  result_index === selection_cursor && "typeahead__item--active"
                )}
                onClick={() => this.handle_result_selection(result)}
                role="option"
                aria-selected={result_index === selection_cursor}
              >
                <a className="typeahead__result">
                  {result.menu_content(query_value)}
                </a>
              </div>
            </div>,
          ];
        })
        .compact()
        .value(),
    ]);

    return (
      <div ref={this.typeahead_ref} className="typeahead">
        <div className="typeahead__search-bar">
          <div className="typeahead__icon-container">
            <span aria-hidden="true">
              <IconSearch
                width="30px"
                color="#2C70C9"
                alternate_color={false}
              />
            </span>
          </div>
          <input
            placeholder={placeholder}
            autoComplete="off"
            value={query_value}
            onFocus={this.handle_input_focus}
            onChange={this.handle_input_change}
            onKeyDown={this.handle_key_down}
            role="combobox"
            aria-autocomplete="none"
            aria-owns={this.menu_id}
            aria-describedby={`${this.menu_id}-hint`}
          />
          {utility_buttons}
        </div>
        <div id={`${this.menu_id}-hint`} className="sr-only" aria-hidden={true}>
          {text_maker("typeahead_usage", { min_length })}
          {additional_a11y_description && (
            <Fragment>
              {/* br ensures typeahead_usage text and additional_a11y_description don't run together */}
              <br />
              {additional_a11y_description}
            </Fragment>
          )}
        </div>
        {this.show_menu && (
          <TypeaheadA11yStatus
            {...{ ...this.props, ...this.state, ...this.derived_menu_state }}
          />
        )}
        {this.show_menu && (
          <AutoSizer>
            {({ width }) => (
              <ReactResizeDetector
                handleWidth
                onResize={() => {
                  virtualized_cell_measure_cache.clearAll();
                }}
              >
                {() => (
                  <AutoHeightVirtualList
                    className="typeahead__dropdown"
                    role="listbox"
                    id={this.menu_id}
                    aria-expanded={this.show_menu}
                    height={list_height}
                    width={width}
                    list_ref={this.virtualized_list_ref}
                    scrollToIndex={selection_cursor >= 0 ? selection_cursor : 0}
                    deferredMeasurementCache={virtualized_cell_measure_cache}
                    rowHeight={virtualized_cell_measure_cache.rowHeight}
                    rowCount={_.size(list_items)}
                    rowRenderer={({
                      index,
                      isScrolling,
                      key,
                      parent,
                      style,
                    }) => (
                      <CellMeasurer
                        cache={virtualized_cell_measure_cache}
                        columnIndex={0}
                        key={key}
                        parent={parent}
                        rowIndex={index}
                      >
                        <div style={style}>
                          {_.isEmpty(matching_results) && (
                            <li className="typeahead__header">
                              {text_maker("no_matches_found")}
                            </li>
                          )}
                          {!_.isEmpty(matching_results) && list_items[index]}
                        </div>
                      </CellMeasurer>
                    )}
                  />
                )}
              </ReactResizeDetector>
            )}
          </AutoSizer>
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
    const { matching_results } = this.state;

    const total_matching_results = _.flatten(matching_results).length;

    const total_menu_items = matching_results.length;

    return {
      total_matching_results,
      total_menu_items,
    };
  }

  /*
    TODO currently using a circular counter to represent the selection cursor in state, pushing off and 
    scattering the work of combining that with other state (such as needs_pagination_up_control etc) to
    translate the counter in to useful information...
    Maybe easier to write, but worse for maintenance. Should claw all that scattered logic back and make 
    this a state machine providing directly useful values.
    i.e. this.default_selection_cursor = "input", all of the logic for what's next after "input" lives in 
    these getters, and they either return a meaningful string or the actual index of an item from matching_results
  */
  default_selection_cursor = -1;
  get previous_selection_cursor() {
    const { selection_cursor } = this.state;
    const { total_menu_items } = this.derived_menu_state;

    if (selection_cursor === this.default_selection_cursor) {
      return total_menu_items - 1;
    } else {
      return selection_cursor - 1;
    }
  }
  get next_selection_cursor() {
    const { selection_cursor } = this.state;
    const { total_menu_items } = this.derived_menu_state;

    if (selection_cursor === total_menu_items - 1) {
      return this.default_selection_cursor;
    } else {
      return selection_cursor + 1;
    }
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
      may_show_menu: true,
      query_value: trimmed_input_value,
    });
  };

  handle_up_arrow = (e) => {
    e.preventDefault();
    this.show_menu &&
      this.setState({ selection_cursor: this.previous_selection_cursor });
  };
  handle_down_arrow = (e) => {
    e.preventDefault();
    this.show_menu &&
      this.setState({ selection_cursor: this.next_selection_cursor });
  };
  handle_enter_key = (e) => {
    if (this.show_menu) {
      e.preventDefault();

      const active_item = this.active_item;

      if (!_.isNull(active_item)) {
        active_item.click();
      } else if (!_.isEmpty(this.state.matching_results)) {
        this.setState({ selection_cursor: 0 });
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

    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_SELECT`,
      MISC2: `Queried: ${query_value}. Selected: ${selected.name}`,
    });

    if (_.isFunction(on_select)) {
      on_select(selected.data);
    }

    this.setState({
      query_value: "",
    });
  };
}

Typeahead.defaultProps = {
  placeholder: text_maker("org_search"),
  min_length: 3,
  on_query: _.noop,
  on_select: _.noop,
};
