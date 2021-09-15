import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import React, { useState } from "react";

import { Typeahead, LeafSpinner } from "src/components/index";

import { log_standard_event } from "src/core/analytics";
import { lang } from "src/core/injected_build_constants";

import { InfoBaseHighlighter } from "src/search/search_utils";

const format_data = (
  name_function,
  menu_content_function,
  data,
  config_group_name
) => ({
  data,
  name: name_function(data),
  menu_content: (search) =>
    _.isFunction(menu_content_function) ? (
      menu_content_function(data, search, name_function)
    ) : (
      <InfoBaseHighlighter search={search} content={name_function(data)} />
    ),
  config_group_name,
});

const get_all_options = _.memoize((search_configs) =>
  _.flatMap(
    search_configs,
    ({ get_data, name_function, menu_content_function, config_name }) =>
      _.map(get_data(), (data) => {
        return format_data(
          name_function,
          menu_content_function,
          data,
          config_name
        );
      })
  )
);
const get_gql_query = (gql_search_configs) => gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${_.reduce(
        gql_search_configs,
        (query_result, { query }) => `
      ${query_result}
      ${query}
      `,
        ``
      )}
    }
  }
`;
const get_config_groups = _.memoize((search_configs) =>
  _.chain(search_configs)
    .map(({ header_function, filter, config_name }, ix) => [
      config_name,
      {
        group_header: header_function(),
        group_filter: filter,
      },
    ])
    .fromPairs()
    .value()
);

const useSearchQuery = (gql_search_configs) => {
  const query = get_gql_query(gql_search_configs);
  const res = useQuery(query, { variables: { lang } });
  if (!res.loading) {
    const data = _.flatMap(
      gql_search_configs,
      ({
        queried_data_accessor,
        name_function,
        menu_content_function,
        config_name,
      }) => {
        return _.map(res.data.root[queried_data_accessor], (row) =>
          format_data(name_function, menu_content_function, row, config_name)
        );
      }
    );

    return { ...res, data };
  }
  return res;
};

export const SearchConfigTypeahead = (props) => {
  const { on_select, search_configs, gql_search_configs } = props;
  const [query_value, set_query_value] = useState("");
  const { loading, data: gql_queried_data } =
    useSearchQuery(gql_search_configs);
  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }

  const on_query = (query_value) => {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: `TYPEAHEAD_SEARCH_QUERY`,
      MISC2: `query: ${query_value}, search_configs: ${_.map(
        props.search_configs,
        "config_name"
      )}`,
    });
    set_query_value(query_value);
  };
  const get_search_results = () => {
    if (query_value) {
      const all_options = _.concat(
        get_all_options(search_configs),
        gql_queried_data
      );
      const config_groups = get_config_groups(
        _.concat(search_configs, gql_search_configs)
      );
      console.log(all_options);
      console.log(config_groups);

      return _.chain(all_options)
        .filter(({ config_group_name, data }) =>
          config_groups[config_group_name].group_filter(query_value, data)
        )
        .groupBy("config_group_name")
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
            set_query_value("");
          },
          content: result.menu_content(query_value),
          plain_text: result.name,
        }))
        .compact()
        .value();
    } else {
      return [];
    }
  };

  return (
    <Typeahead
      {...props}
      on_query={on_query}
      query_value={query_value}
      results={get_search_results()}
    />
  );
};
