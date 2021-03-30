import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

import { Typeahead } from "./Typeahead/Typeahead.js";

import text from "./Typeahead/Typeahead.yaml";

const { TM } = create_text_maker_component(text);

export class SubjectWrappedTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      matching_results: [],
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
        force_update_matching_results: true,
      };
    } else {
      return null;
    }
  }
  update_matching_results = (query_value) => {
    const { all_options, config_groups } = this.props;

    this.setState({
      matching_results: _.filter(all_options, ({ config_group_index, data }) =>
        // could use optional chaining, but we WANT this to fail fast and loud, to catch
        // malformed search_configs during development. Should be safe otherwsie
        config_groups[config_group_index].group_filter(query_value, data)
      ),
      force_update_matching_results: false,
    });
  };
  debounced_on_query = _.debounce((query_value) => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${query_value}, search_configs: ${_.map(
        this.props.search_configs,
        "config_name"
      )}`,
    });
  }, 400);
  render() {
    const { matching_results, force_update_matching_results } = this.state;
    const { config_groups } = this.props;

    const list_items_render = (query_value, selection_cursor) =>
      _.compact([
        ..._.chain(matching_results)
          .groupBy("config_group_index")
          .flatMap((results, group_index) =>
            _.map(results, (result, index) => ({
              is_first_in_group: index === 0,
              group_index,
              result,
            }))
          )
          .flatMap(
            ({ is_first_in_group, group_index, result }, result_index) => {
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
                          total_matching_results: matching_results.length,
                        }}
                      />
                    </div>
                  )}
                  {is_first_in_group && (
                    <div
                      className="typeahead__header"
                      key={`group-${group_index}`}
                    >
                      {config_groups[group_index].group_header}
                    </div>
                  )}
                  <div
                    className={classNames(
                      "typeahead__item",
                      result_index === selection_cursor &&
                        "typeahead__item--active"
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
            }
          )
          .compact()
          .value(),
      ]);

    return (
      <Typeahead
        {...this.props}
        matching_results={matching_results}
        update_matching_results={this.update_matching_results}
        list_items_render={list_items_render}
        force_update_matching_results={force_update_matching_results}
        debounced_on_query={this.debounced_on_query}
      />
    );
  }
}
