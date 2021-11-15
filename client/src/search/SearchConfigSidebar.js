import _ from "lodash";
import React from "react";

import { SideBarSearch } from "src/glossary/SideBarSearch";

export class SearchConfigSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query_value: "",
    };
  }

  on_query = (query_value) => {
    this.setState({ query_value });
    this.props.getResults(this.results);
    this.props.setQuery(this.state.query_value);
  };

  render() {
    return <SideBarSearch {...this.props} on_query={this.on_query} />;
  }

  get results() {
    const { search_configs } = this.props;
    const { query_value } = this.state;

    if (query_value) {
      const all_options = this.get_all_options(search_configs);
      const config_groups = this.get_config_groups(search_configs);

      return _.chain(all_options)
        .filter(({ config_group_index, data }) =>
          config_groups[config_group_index].group_filter(query_value, data)
        )
        .groupBy("config_group_index")
        .flatMap((results) =>
          _.map(results, (result) => ({
            result,
          }))
        )
        .map(({ result }) => ({
          id: result.data.id,
          title: result.data.title,
          raw_definition: result.data.raw_definition,
          translation: result.data.translation,
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
