import _ from "lodash";
import React from "react";

import { Typeahead } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query_value: "",
      current_search_configs: props.search_configs,
    };
  }

  on_query = (query_value) => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${query_value}, search_configs: ${_.map(
        this.props.search_configs,
        "config_name"
      )}`,
    });

    this.setState({ query_value });
  };

  get results() {
    const { all_options, config_groups, on_select } = this.props;
    const { query_value } = this.state;

    return (
      query_value !== "" &&
      _.chain(all_options)
        .filter(({ config_group_index, data }) =>
          // could use optional chaining, but we WANT this to fail fast and loud, to catch
          // malformed search_configs during development. Should be safe otherwsie
          config_groups[config_group_index].group_filter(query_value, data)
        )
        .groupBy("config_group_index")
        .flatMap((results, group_index) =>
          _.map(results, (result, index) => ({
            is_first_in_group: index === 0,
            group_index,
            result,
          }))
        )
        .map(({ is_first_in_group, group_index, result }) => ({
          header: is_first_in_group && (
            <div className="typeahead__header" key={`group-${group_index}`}>
              {config_groups[group_index].group_header}
            </div>
          ),
          on_select: () => {
            log_standard_event({
              SUBAPP: window.location.hash.replace("#", ""),
              MISC1: `TYPEAHEAD_SEARCH_SELECT`,
              MISC2: `Queried: ${query_value}. Selected: ${result.name}`,
            });

            if (_.isFunction(on_select)) {
              on_select(result.data);
            }

            this.setState({
              query_value: "",
            });
          },
          content: <a>{result.menu_content(query_value)}</a>,
          plain_text: result.name,
        }))
        .compact()
        .value()
    );
  }

  render() {
    const { query_value } = this.state;

    return (
      <Typeahead
        {...this.props}
        on_query={this.on_query}
        query_value={query_value}
        results={this.results}
      />
    );
  }
}
