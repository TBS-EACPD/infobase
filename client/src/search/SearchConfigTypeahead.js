import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  create_text_maker_component,
  Typeahead,
} from "src/components/index.js";

import text from "src/components/Typeahead/Typeahead.yaml";

import { log_standard_event } from "src/core/analytics.js";

const { TM } = create_text_maker_component(text);

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      current_search_configs: props.search_configs,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { search_configs } = nextProps;
    const { current_search_configs } = prevState;

    if (search_configs !== current_search_configs) {
      return {
        results: [],
        current_search_configs: search_configs,
        force_update_results: true,
      };
    } else {
      return null;
    }
  }
  update_results = (query_value) => {
    const { all_options, config_groups } = this.props;

    this.setState({
      results: _.filter(all_options, ({ config_group_index, data }) =>
        // could use optional chaining, but we WANT this to fail fast and loud, to catch
        // malformed search_configs during development. Should be safe otherwsie
        config_groups[config_group_index].group_filter(query_value, data)
      ),
      force_update_results: false,
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

  list_items_render = (query_value, selection_cursor) => {
    const { results } = this.state;
    const { config_groups } = this.props;
    return _.compact([
      ..._.chain(results)
        .groupBy("config_group_index")
        .flatMap((results, group_index) =>
          _.map(results, (result, index) => ({
            is_first_in_group: index === 0,
            group_index,
            result,
          }))
        )
        .map(({ is_first_in_group, group_index, result }, result_index) => (
          <Fragment key={`result-${result_index}`}>
            {result_index === 0 && (
              <div
                key="header"
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
            {is_first_in_group && (
              <div className="typeahead__header" key={`group-${group_index}`}>
                {config_groups[group_index].group_header}
              </div>
            )}
            <div
              className={classNames(
                "typeahead__result",
                result_index === selection_cursor && "typeahead__result--active"
              )}
              onClick={() => this.handle_result_selection(result)}
              role="option"
              aria-selected={result_index === selection_cursor}
            >
              <a>{result.menu_content(query_value)}</a>
            </div>
          </Fragment>
        ))
        .value(),
    ]);
  };

  get_selected_item_text = (selection_cursor) =>
    this.state.results[selection_cursor].name;
  render() {
    const { results, force_update_results } = this.state;

    return (
      <Typeahead
        {...this.props}
        results={results}
        update_results={this.update_results}
        list_items_render={this.list_items_render}
        force_update_results={force_update_results}
        debounced_on_query={this.debounced_on_query}
        get_selected_item_text={this.get_selected_item_text}
      />
    );
  }
}
