import _ from "lodash";
import React from "react";

import { Typeahead } from "src/components/index";

import { log_standard_event } from "src/core/analytics";

import { SearchHighlighter } from "src/search/search_utils";

export class SearchConfigTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query_value: "",
    };
  }

  componentDidUpdate() {
    const { search_configs } = this.props;
    const { query_value, ...results_by_config_name_and_query } = this.state;

    _.each(
      search_configs,
      ({
        config_name,
        query,
        header_function,
        name_function,
        menu_content_function,
      }) => {
        const is_unloaded = _.chain(results_by_config_name_and_query)
          .get(`${config_name}[${query_value}]`)
          .isUndefined()
          .value();

        if (is_unloaded) {
          query(query_value).then((matches) => {
            const is_unloaded = _.chain(
              this.state.results_by_config_name_and_query
            )
              .get(`${config_name}[${query_value}]`)
              .isUndefined()
              .value();

            if (is_unloaded) {
              const results = _.map(matches, (match, index) => ({
                header: index === 0 && header_function(),
                on_select: () => {
                  log_standard_event({
                    SUBAPP: window.location.hash.replace("#", ""),
                    MISC1: `TYPEAHEAD_SEARCH_SELECT`,
                    MISC2: `Queried: ${query_value}. Selected: ${name_function(
                      match
                    )}`,
                  });

                  if (_.isFunction(this.props.on_select)) {
                    this.props.on_select(match);
                  }

                  this.setState({
                    query_value: "",
                  });
                },
                content: _.isFunction(menu_content_function) ? (
                  menu_content_function(match, query_value, name_function)
                ) : (
                  <SearchHighlighter
                    search={query_value}
                    content={name_function(match)}
                  />
                ),
                plain_text: name_function(match),
              }));

              // TODO some risk competing promises could clober the nested state here, ugh
              this.setState({
                [config_name]: {
                  ...this.state[config_name],
                  [query_value]: results,
                },
              });
            }
          });
        }
      }
    );
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
    const { search_configs } = this.props;
    const { query_value, ...results_by_config_name_and_query } = this.state;

    const results = _.flatMap(search_configs, ({ config_name }) =>
      _.get(results_by_config_name_and_query, `${config_name}[${query_value}]`)
    );

    // TODO if we want to display any results early, the Typeahead will need to understand a loading state
    // (to delay showing counts and communicate loading status)
    const is_loading = _.some(results, _.isUndefined);

    return (
      <Typeahead
        {...this.props}
        on_query={this.on_query}
        query_value={query_value}
        results={_.compact(results)}
        loading_results={is_loading}
      />
    );
  }
}
