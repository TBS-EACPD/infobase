import _ from "lodash";
import React from "react";

import { Typeahead } from "src/components/index";

import { log_standard_event } from "src/core/analytics";

import { get_simplified_search_phrase } from "./search_utils";

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_phrase: "",
    };

    this.is_unmounting = false;
  }

  componentWillUnmount() {
    this.is_unmounting = true;
  }

  componentDidUpdate() {
    const { search_configs } = this.props;
    const { search_phrase } = this.state;

    if (search_phrase !== "") {
      _.each(search_configs, (search_config) => {
        const { config_name, query } = search_config;

        const is_not_loading_or_loaded = _.isUndefined(
          this.get_query_result_state(config_name, search_phrase)
        );

        if (is_not_loading_or_loaded) {
          this.set_query_result_state(
            config_name,
            search_phrase,
            "loading",
            () =>
              query(search_phrase).then(
                (matches) =>
                  !this.is_unmounting &&
                  this.set_query_result_state(
                    config_name,
                    search_phrase,
                    this.results_from_matches(
                      matches,
                      search_phrase,
                      search_config
                    )
                  )
              )
          );
        }
      });
    }
  }
  results_from_matches = (
    matches,
    search_phrase,
    { header_function, name_function, menu_content_function }
  ) =>
    _.map(matches, (match, index) => ({
      header: index === 0 && header_function(),
      on_select: this.get_result_on_select(search_phrase, name_function, match),
      content: menu_content_function(match, search_phrase, name_function),
      plain_text: name_function(match),
    }));
  get_result_on_select = (search_phrase, name_function, match) => () => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_SELECT`,
      MISC2: `Queried: ${search_phrase}. Selected: ${name_function(match)}`,
    });

    if (_.isFunction(this.props.on_select)) {
      this.props.on_select(match);
    }

    this.setState({
      search_phrase: "",
    });
  };

  get_query_result_state_key = (config_name, search_phrase) =>
    `${config_name}__${get_simplified_search_phrase(search_phrase)}`;
  get_query_result_state = (config_name, search_phrase) =>
    this.state[this.get_query_result_state_key(config_name, search_phrase)];
  set_query_result_state = (
    config_name,
    search_phrase,
    state,
    callback = _.noop
  ) =>
    this.setState(
      {
        [this.get_query_result_state_key(config_name, search_phrase)]: state,
      },
      callback
    );

  on_query = (search_phrase) => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${search_phrase}, search_configs: ${_.map(
        this.props.search_configs,
        "config_name"
      )}`,
    });

    this.setState({ search_phrase });
  };

  render() {
    const { search_configs } = this.props;
    const { search_phrase } = this.state;

    const maybe_results = _.flatMap(search_configs, ({ config_name }) =>
      this.get_query_result_state(config_name, search_phrase)
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
        query_value={search_phrase}
        results={results}
        loading_results={still_loading_results}
      />
    );
  }
}
