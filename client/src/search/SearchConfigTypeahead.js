import _ from "lodash";
import React from "react";

import { Typeahead } from "src/components/index.js";

import { log_standard_event } from "src/core/analytics.js";

import { InfoBaseHighlighter } from "src/search/search_utils.js";

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query_value: "",
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

  get results() {
    const { on_select, search_configs } = this.props;
    const { query_value } = this.state;

    if (query_value) {
      const all_options = this.get_all_options(search_configs);
      const config_groups = this.get_config_groups(search_configs);

      return _.chain(all_options)
        .filter(({ config_group_index, data }) =>
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
          header: is_first_in_group && config_groups[group_index].group_header,
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
        .value();
    } else {
      return [];
    }
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
  get_config_groups = _.memoize((search_configs) =>
    _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }))
  );
}
