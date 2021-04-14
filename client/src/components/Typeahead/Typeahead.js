import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import ReactResizeDetector from "react-resize-detector/build/withPolyfill";

import { AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";

import { AutoHeightVirtualList } from "src/components/AutoHeightVirtualList.js";
import { create_text_maker_component } from "src/components/misc_util_components.js";

import { IconSearch } from "src/icons/icons.js";

import { TypeaheadA11yStatus } from "./TypeaheadA11yStatus.js";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker } = create_text_maker_component(text);

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
      selection_cursor: this.default_selection_cursor,
    };
  }

  debounced_on_query = (query) =>
    _.debounce(this.props.on_query(query), this.props.on_query_debounce_time);

  componentDidMount() {
    document.body.addEventListener("click", this.handle_window_click);
  }
  componentWillUnmount() {
    this.debounced_on_query.cancel();
    document.body.removeEventListener("click", this.handle_window_click);
  }

  componentDidUpdate(prevProps, prevState) {
    const { query_value, selection_cursor, may_show_menu } = this.state;
    const {
      query_value: prev_query_value,
      selection_cursor: prev_selection_cursor,
      may_show_menu: prev_may_show_menu,
    } = prevState;

    if (
      query_value !== prev_query_value ||
      (this.show_menu && may_show_menu !== prev_may_show_menu)
    ) {
      virtualized_cell_measure_cache.clearAll();

      this.setState({
        selection_cursor: this.default_selection_cursor,
      });
    }

    if (this.virtualized_list_ref.current) {
      if (
        selection_cursor !== prev_selection_cursor &&
        prev_selection_cursor > selection_cursor
      ) {
        //scrolling up is choppy if we don't do this
        this.virtualized_list_ref.current.recomputeRowHeights(
          selection_cursor >= 0 ? selection_cursor : 0
        );
      }
    }
  }

  render() {
    const {
      placeholder,
      additional_a11y_description,
      min_length,
      utility_buttons,
      matching_results,
    } = this.props;

    const { query_value, selection_cursor } = this.state;

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
            min_length={min_length}
            selection_cursor={selection_cursor}
            matching_results={matching_results}
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
                    width={width}
                    list_ref={this.virtualized_list_ref}
                    scrollToIndex={selection_cursor >= 0 ? selection_cursor : 0}
                    deferredMeasurementCache={virtualized_cell_measure_cache}
                    rowHeight={virtualized_cell_measure_cache.rowHeight}
                    rowCount={matching_results.length || 1}
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
                          {_.isEmpty(matching_results) ? (
                            <div className="typeahead__header">
                              {text_maker("no_matches_found")}
                            </div>
                          ) : (
                            _.map(
                              matching_results,
                              (
                                { id, result_header, result_content },
                                result_index
                              ) => (
                                <Fragment key={id || result_index}>
                                  {result_header && (
                                    <div className="typeahead__header">
                                      {result_header}
                                    </div>
                                  )}
                                  <div
                                    className={classNames(
                                      "typeahead__result",
                                      result_index === selection_cursor &&
                                        "typeahead__result--active"
                                    )}
                                    role="option"
                                    aria-selected={
                                      result_index === selection_cursor
                                    }
                                  >
                                    {result_content}
                                  </div>
                                </Fragment>
                              )
                            )
                          )}
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
    return this.typeahead_ref.current.querySelector(
      ".typeahead__result--active"
    );
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
    const { matching_results } = this.props;

    if (selection_cursor === this.default_selection_cursor) {
      return matching_results.length - 1;
    } else {
      return selection_cursor - 1;
    }
  }
  get next_selection_cursor() {
    const { selection_cursor } = this.state;
    const { matching_results } = this.props;

    if (selection_cursor === matching_results.length - 1) {
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
      } else if (!_.isEmpty(this.props.matching_results)) {
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
}

Typeahead.defaultProps = {
  placeholder: text_maker("search"),
  min_length: 3,
  on_query_debounce_time: 400,
  on_select: _.noop,
};
