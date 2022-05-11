import classNames from "classnames";
import _ from "lodash";
import type { ChangeEvent, KeyboardEvent } from "react";
import React, { Fragment } from "react";

import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";
import { create_text_maker_component } from "src/components/misc_util_components";

import { IconSearch } from "src/icons/icons";

import { TypeaheadA11yStatus } from "./TypeaheadA11yStatus";

import text from "./Typeahead.yaml";
import "./Typeahead.scss";

const { text_maker, TM } = create_text_maker_component(text);

/*
  Currently using a circular counter to represent the selection cursor in state (potentially a TODO to rewrite, 
  maybe make it a state machine). Small quirk, includes -1 which represents the text input. Otherwise, corresponds
  to an item in the typeahead results
*/
const default_selection_cursor = -1;

const TypeaheadDefaultProps = {
  placeholder: text_maker("search") as string,
  min_length: 3,
  on_query_debounce_time: 300,
};
type TypeaheadProps = typeof TypeaheadDefaultProps & {
  on_query: (str: string) => void;
  query_value: string;
  results: ResultProps[];
  loading_results?: boolean;
  additional_a11y_description?: string;
  utility_buttons?: boolean | React.ReactNode | React.ReactNode[];
};

interface TypeaheadState {
  input_value: string;
  may_show_menu: boolean;
  selection_cursor: number;
  results?: ResultProps[];
}

export interface ResultProps {
  header?: React.ReactNode;
  on_select: () => void;
  content: React.ReactNode;
  plain_text: string;
}

export class Typeahead extends React.Component<TypeaheadProps, TypeaheadState> {
  static defaultProps = TypeaheadDefaultProps;

  menu_id: string;

  private typeahead_ref = React.createRef<HTMLDivElement>();
  private dropdown_ref = React.createRef<HTMLDivElement>();
  private selected_item_ref = React.createRef<HTMLDivElement>();

  constructor(props: TypeaheadProps) {
    super(props);
    const { query_value, min_length } = props;

    this.menu_id = _.uniqueId("typeahead-");

    this.state = {
      input_value: query_value,
      may_show_menu: query_value.length >= min_length,
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

  static getDerivedStateFromProps(
    nextProps: TypeaheadProps,
    prevState: TypeaheadState
  ) {
    const { results: next_results } = nextProps;
    const { results: prev_results } = prevState;

    if (next_results !== prev_results) {
      return {
        results: next_results,
        selection_cursor: default_selection_cursor,
      };
    } else {
      return null;
    }
  }

  componentDidUpdate(_prevProps: TypeaheadProps, prevState: TypeaheadState) {
    const { selection_cursor } = this.state;
    const { selection_cursor: prev_selection_cursor } = prevState;

    const dropdown = this.dropdown_ref.current;
    const selected_item = this.selected_item_ref.current;

    if (
      selection_cursor !== prev_selection_cursor &&
      dropdown &&
      selected_item
    ) {
      const is_item_fully_visible_in_dropdown =
        selected_item.offsetTop >= dropdown.scrollTop &&
        selected_item.offsetTop + selected_item.offsetHeight <=
          dropdown.scrollTop + dropdown.offsetHeight;

      if (!is_item_fully_visible_in_dropdown) {
        if (selection_cursor > prev_selection_cursor) {
          dropdown.scrollTop = selected_item.offsetTop;
        } else {
          dropdown.scrollTop =
            selected_item.offsetTop +
            selected_item.offsetHeight -
            dropdown.offsetHeight;
        }
      }
    }
  }

  render() {
    const {
      placeholder,
      min_length,
      results,
      loading_results,
      additional_a11y_description,
      utility_buttons,
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
            type="text"
            onFocus={this.handle_input_focus}
            onChange={this.handle_input_change}
            onKeyDown={this.handle_key_down}
            role="combobox"
            aria-autocomplete="none"
            aria-owns={this.menu_id}
            aria-controls={this.menu_id}
            aria-label={text_maker("explorer_search")}
            aria-describedby={`${this.menu_id}-hint`}
            aria-expanded={this.show_menu}
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
            selection_cursor={selection_cursor}
            results={results}
            loading_results={loading_results}
          />
        )}
        {this.show_menu && (
          <div
            className="typeahead__dropdown"
            role="listbox"
            id={this.menu_id}
            aria-expanded={this.show_menu}
            ref={this.dropdown_ref}
          >
            <div className="typeahead__header" style={{ borderTop: "none" }}>
              {loading_results || !_.isEmpty(results) ? (
                <>
                  <TM
                    k="menu_with_results_status"
                    args={{
                      total_results: results.length,
                      loading_results,
                    }}
                  />
                  {loading_results && (
                    <LeafSpinner config_name={"inline_small"} />
                  )}
                </>
              ) : (
                text_maker("no_matches_found")
              )}
            </div>
            {_.map(results, ({ header, on_select, content }, result_index) => (
              <Fragment key={result_index}>
                {!loading_results && !_.isEmpty(results) && (
                  <Fragment>
                    {header && (
                      <div className="typeahead__header">{header}</div>
                    )}
                    <div
                      className={classNames(
                        "typeahead__result",
                        result_index === selection_cursor &&
                          "typeahead__result--active"
                      )}
                      tabIndex={0}
                      role="option"
                      aria-selected={result_index === selection_cursor}
                      ref={
                        result_index === selection_cursor
                          ? this.selected_item_ref
                          : undefined
                      }
                      onKeyPress={(event) =>
                        _.includes(["Enter", " "], event.key) && on_select()
                      }
                      onClick={on_select}
                    >
                      {content}
                    </div>
                  </Fragment>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  get show_menu() {
    const { query_value, min_length } = this.props;
    const { may_show_menu } = this.state;

    return may_show_menu && query_value.length >= min_length;
  }

  get allow_keyboard_navigation() {
    const { loading_results } = this.props;

    return this.show_menu && !loading_results;
  }

  get active_item() {
    const active_item: HTMLElement | null = this.typeahead_ref.current
      ? this.typeahead_ref.current.querySelector(".typeahead__result--active")
      : null;
    return active_item;
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

  handle_window_click = (e: MouseEvent) => {
    if (
      this.typeahead_ref.current &&
      !this.typeahead_ref.current.contains(e.target as Node)
    ) {
      this.setState({ may_show_menu: false });
    }
  };

  handle_input_focus = () => this.setState({ may_show_menu: true });

  handle_input_change = (event: ChangeEvent<HTMLInputElement>) => {
    const input_value = event.target.value;

    const cleaned_input_value = _.chain(input_value).trim().deburr().value();
    this.debounced_on_query(cleaned_input_value);

    this.setState({
      input_value,
      may_show_menu: true,
    });
  };

  handle_key_down = (e: KeyboardEvent<HTMLInputElement>) => {
    if (this.allow_keyboard_navigation) {
      switch (e.key) {
        case "ArrowUp":
          this.handle_up_arrow(e);
          break;
        case "ArrowDown":
          this.handle_down_arrow(e);
          break;
        case "Enter":
          this.handle_enter_key(e);
          break;
      }
    }
  };
  handle_up_arrow = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.setState({ selection_cursor: this.previous_selection_cursor });
  };
  handle_down_arrow = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.setState({ selection_cursor: this.next_selection_cursor });
  };
  handle_enter_key = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const active_item = this.active_item;

    if (!_.isNull(active_item)) {
      active_item.click();
    } else if (!_.isEmpty(this.props.results)) {
      this.setState({ selection_cursor: 0 });
    }
  };
}
