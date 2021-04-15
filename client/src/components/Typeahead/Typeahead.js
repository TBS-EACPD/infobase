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

const { text_maker, TM } = create_text_maker_component(text);

const virtualized_cell_measure_cache = new CellMeasurerCache({
  fixedWidth: true,
});

/*
  Currently using a circular counter to represent the selection cursor in state (potentially a TODO to rewrite, 
  maybe make it a state machine). Small quirk, includes -1 which represents the text input. Otherwise, corresponds
  to an item in the typeahead results
*/
const default_selection_cursor = -1;

/*
  Required props:
    on_query: callback, called with debounce on input change. Responsible for updating the query_value and results props

    query_value: string, required. The query value currently used by the parent, not necessarily the same as the typeahead's internal input_value state

    results: [{
      header: string || component, optional. Non-option content to render above the result in the typeahead list,
      on_select: callback, required,
      content: string || component, required. Inner content for rendering,
      plain_text: string, required. Specifically for use in a11y readout,
    }]
*/

export class Typeahead extends React.Component {
  constructor(props) {
    super(props);

    this.typeahead_ref = React.createRef();
    this.virtualized_list_ref = React.createRef();

    this.menu_id = _.uniqueId("typeahead-");

    this.state = {
      input_value: this.props.query_value,
      may_show_menu: false,
      selection_cursor: default_selection_cursor,
    };
  }

  debounced_on_query = _.debounce((cleaned_input_value) => {
    const { min_length, query_value, on_query } = this.props;

    if (cleaned_input_value.length >= min_length) {
      query_value !== cleaned_input_value && on_query(cleaned_input_value);
    } else {
      query_value !== "" && on_query("");
    }
  }, this.props.on_query_debounce_time);

  componentDidMount() {
    document.body.addEventListener("click", this.handle_window_click);
  }
  componentWillUnmount() {
    this.debounced_on_query.cancel();
    document.body.removeEventListener("click", this.handle_window_click);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { results: next_results } = nextProps;
    const { results: prev_results } = prevState;

    if (next_results !== prev_results) {
      virtualized_cell_measure_cache.clearAll();

      return {
        results: next_results,
        selection_cursor: default_selection_cursor,
      };
    } else {
      return null;
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { selection_cursor } = this.state;
    const { selection_cursor: prev_selection_cursor } = prevState;

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
      results,
    } = this.props;

    const { input_value, selection_cursor } = this.state;

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
            value={input_value}
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
            results={results}
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
                    rowCount={results.length || 1}
                    rowRenderer={({
                      index: result_index,
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
                        rowIndex={result_index}
                      >
                        <div style={style}>
                          {_.isEmpty(results) ? (
                            <div className="typeahead__header">
                              {text_maker("no_matches_found")}
                            </div>
                          ) : (
                            <Fragment key={result_index}>
                              {result_index === 0 && (
                                <div
                                  className="typeahead__header"
                                  style={{ borderTop: "none" }}
                                >
                                  <TM
                                    k="menu_with_results_status"
                                    args={{
                                      total_results: results.length,
                                    }}
                                  />
                                </div>
                              )}
                              {results[result_index].header && (
                                <div className="typeahead__header">
                                  {results[result_index].header}
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
                                onClick={results[result_index].on_select}
                              >
                                {results[result_index].content}
                              </div>
                            </Fragment>
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
    const { query_value, min_length } = this.props;
    const { may_show_menu } = this.state;

    return may_show_menu && query_value.length >= min_length;
  }

  get active_item() {
    return this.typeahead_ref.current.querySelector(
      ".typeahead__result--active"
    );
  }

  get previous_selection_cursor() {
    const { selection_cursor } = this.state;
    const { results } = this.props;

    if (selection_cursor === default_selection_cursor) {
      return results.length - 1;
    } else {
      return selection_cursor - 1;
    }
  }
  get next_selection_cursor() {
    const { selection_cursor } = this.state;
    const { results } = this.props;

    if (selection_cursor === results.length - 1) {
      return default_selection_cursor;
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
    const input_value = event.target.value;

    const cleaned_input_value = _.chain(input_value).trim().deburr().value();
    this.debounced_on_query(cleaned_input_value);

    this.setState({
      input_value,
      may_show_menu: true,
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
      } else if (!_.isEmpty(this.props.results)) {
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
  on_query_debounce_time: 300,
};
