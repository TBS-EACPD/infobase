import _ from "lodash";
import React from "react";

import string_hash from "string-hash";

import { Typeahead } from "src/components/index";

import { log_standard_event } from "src/core/analytics";

const get_query_result_state_key = (config_name, query_value) =>
  `${config_name}__${string_hash(query_value)}`;

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query_value: "",
    };

    this.is_unmounting = false;
  }

  componentWillUnmount() {
    this.is_unmounting = true;
  }

  componentDidUpdate() {
    const { search_configs } = this.props;
    const { query_value } = this.state;

    _.each(search_configs, (search_config) => {
      const { config_name, query } = search_config;

      const is_not_loading_or_loaded = _.isUndefined(
        this.state[get_query_result_state_key(config_name, query_value)]
      );

      if (is_not_loading_or_loaded) {
        this.setState(
          {
            [get_query_result_state_key(config_name, query_value)]: "loading",
          },
          () =>
            query(query_value).then(
              (matches) =>
                !this.is_unmounting &&
                this.setState({
                  [get_query_result_state_key(config_name, query_value)]:
                    this.results_from_matches(
                      matches,
                      query_value,
                      search_config
                    ),
                })
            )
        );
      }
    });
  }
  results_from_matches = (
    matches,
    query_value,
    { header_function, name_function, menu_content_function }
  ) =>
    _.map(matches, (match, index) => ({
      header: index === 0 && header_function(),
      on_select: this.get_result_on_select(query_value, name_function, match),
      content: menu_content_function(match, query_value, name_function),
      plain_text: name_function(match),
    }));
  get_result_on_select = (query_value, name_function, match) => () => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_SELECT`,
      MISC2: `Queried: ${query_value}. Selected: ${name_function(match)}`,
    });

    if (_.isFunction(this.props.on_select)) {
      this.props.on_select(match);
    }

    this.setState({
      query_value: "",
    });
  };

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
    const { search_configs } = this.props;
    const { query_value } = this.state;

    const maybe_results = _.flatMap(
      search_configs,
      ({ config_name }) =>
        this.state[get_query_result_state_key(config_name, query_value)]
    );

    const still_loading_results = _.some(
      maybe_results,
      (result) => _.isUndefined(result) || result === "loading"
    );

    const results = !still_loading_results ? maybe_results : [];

    return (
      <Typeahead
        {...this.props}
        on_query={this.on_query}
        query_value={query_value}
        results={results}
        loading_results={still_loading_results}
      />
    );
  }
}
