import _ from "lodash";
import React from "react";

import { Typeahead } from "src/components/index";

import { log_standard_event } from "src/core/analytics";

import { InfoBaseHighlighter } from "src/search/search_utils";

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
                  <InfoBaseHighlighter
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
        is_loading={is_loading}
        results={_.compact(results)}
      />
    );
  }

  /*
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
          content: result.menu_content(query_value),
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
  */
}
