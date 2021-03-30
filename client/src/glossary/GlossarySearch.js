import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import { lang } from "src/core/injected_build_constants.js";

import { glossary_href } from "src/link_utils.js";

import { glossary as glossary_search_config } from "src/search/search_configs.js";
import { InfoBaseHighlighter } from "src/search/search_utils.js";
import { SubjectWrappedTypeahead } from "src/search/SubjectWrappedTypeahead.js";

const glossary_placeholder = {
  en: "Search for a term used in GC InfoBase",
  fr: "Rechercher un terme utilisé dans InfoBase du GC",
}[lang];

const GlossarySearch = withRouter(
  class GlossarySearch extends React.Component {
    render() {
      const { history } = this.props;

      return (
        <SubjectWrappedTypeahead
          placeholder={glossary_placeholder}
          search_configs={[glossary_search_config]}
          config_groups={this.config_groups}
          all_options={this.all_options}
          on_select={({ id }) =>
            history.push(glossary_href(id).replace("#", "/"))
          }
          min_length={2}
        />
      );
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
    get all_options() {
      return this.get_all_options([glossary_search_config]);
    }
    get config_groups() {
      return this.get_config_groups([glossary_search_config]);
    }
  }
);

export { GlossarySearch };
