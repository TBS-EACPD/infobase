import _ from "lodash";
import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import ReactDOM from "react-dom";

import { TM } from "../components/TextMaker.js";
import { log_standard_event } from "../core/analytics.js";
import { create_text_maker } from "../models/text.js";

import { InfoBaseHighlighter } from "./search_utils.js";
import { Typeahead } from "./Typeahead.js";

import text from "./BaseTypeahead.yaml";

// Uncomment following line once we've moved to bootstrap4
// import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import "./BaseTypeahead.scss";
import "react-bootstrap-typeahead/css/Typeahead.css";

const text_maker = create_text_maker(text);
const TextMaker = (props) => <TM tmf={text_maker} {...props} />;

export class BaseTypeahead extends React.Component {
  constructor() {
    super();

    // Hacky, but had to implement pagination at the filtering level due to this typeahead having a really rigid API.
    // query_matched_counter is used to make sure only items "on the page" make it through the filter, it is reset to 0 every
    // time the menu renders (which should always happen right after the filtering is done)
    this.reset_pagination();
  }
  reset_pagination() {
    this.query_matched_counter = 0;
    this.pagination_index = 0;
  }
  refresh_dropdown_menu() {
    if (this.typeahead) {
      this.typeahead.getInstance().blur();
      this.typeahead.getInstance().focus();
    }
  }
  render() {
    const {
      pagination_size,
      placeholder,
      minLength,
      large,
      onNewQuery,
      onSelect,
      search_configs,
      filter_content,
    } = this.props;

    const bootstrapSize = large ? "large" : "small";

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

    const config_groups = _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }));

    // Options includes placeholders for pagination items, because the number of results passed to renderMenu
    // (ie. that get through filterBy) needs to actually match the number of lis ultimately rendered, can't
    // just insert the pagination items when renderMenu is called
    const all_options = [
      {
        pagination_placeholder: true,
        paginate_direction: "previous",
      },
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
      {
        pagination_placeholder: true,
        paginate_direction: "next",
      },
    ];

    // Didn't like the default pagination, but due to API rigidness I had to implement my own at the filtering level
    const paginate_results = () => {
      const page_start = pagination_size * this.pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(
        this.query_matched_counter < page_start ||
        this.query_matched_counter >= page_end
      );

      this.query_matched_counter++;

      return is_on_displayed_page;
    };

    const filterBy = (option, props) => {
      if (option.pagination_placeholder) {
        if (option.paginate_direction === "previous") {
          return this.pagination_index > 0;
        } else if (option.paginate_direction === "next") {
          return true; // can't yet tell if next button's needed at this point, so always pass it's placeholder through
        }
      }

      const query = props.search_text;
      const group_filter =
        config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(query, option.data);

      if (query_matches) {
        return paginate_results();
      } else {
        return false;
      }
    };

    return (
      <Typeahead
        main_filter="name"
        paginate={false} // Turn off built in pagination
        placeholder={placeholder}
        minLength={minLength}
        bsSize={bootstrapSize}
        search_values={all_options} // API's a bit vague here, options is the data to search over, not a config object
        filterBy={filterBy}
        // API's a bit vague here, this onChange is "on change" set of options selected from the typeahead dropdown. Selected is an array of selected items,
        // but BaseTypeahead will only ever use single selection, so just picking the first (and, we'd expect, only) item and passing it to onSelect is fine
        onChange={(selected) => {
          const anything_selected = !_.isEmpty(selected);
          if (anything_selected) {
            this.reset_pagination();

            // this.typeahead.getInstance().clear();

            if (_.isFunction(onSelect)) {
              onSelect(selected.data);
            }

            log_standard_event({
              SUBAPP: window.location.hash.replace("#", ""),
              MISC1: `TYPEAHEAD_SEARCH_SELECT`,
              MISC2: `selected: ${selected.name}`,
            });
          }
        }}
        // receives events selecting an option with the pagination_placeholder: true property
        onPaginate={(e) => {
          let selected_item;

          if (e.type !== "click") {
            // for non-click events, the target item  has been classed "active" by onPaginate call
            selected_item = this.typeahead_node.querySelector("li.active");
          } else {
            // for click events, need to find the targeted li, possibly an ancestor of the event target
            selected_item =
              e.target.tagName.toLowerCase() === "li"
                ? e.target
                : e.target.closest("li");
          }

          if (selected_item) {
            if (selected_item.className.includes("previous")) {
              this.pagination_index--;
            } else if (selected_item.className.includes("next")) {
              this.pagination_index++;
            }
            this.refresh_dropdown_menu();
          }
        }}
        //
        filter_content={filter_content}
        onNewQuery={onNewQuery}
        placeholder={
          this.props.placeholder ||
          trivial_text_maker("everything_search_placeholder")
        }
        search_configs={search_configs}
        onSelect={onSelect}
        filter_content={filter_content}
      />
    );
  }
}

BaseTypeahead.defaultProps = {
  pagination_size: 30,
  placeholder: text_maker("org_search"),
  minLength: 3,
  large: true,
  onNewQuery: _.noop,
};
