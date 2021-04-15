import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import { lang } from "src/core/injected_build_constants.js";

import { glossary_href } from "src/link_utils.js";

import { glossary as glossary_search_config } from "src/search/search_configs.js";
import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead.js";

const glossary_placeholder = {
  en: "Search for a term used in GC InfoBase",
  fr: "Rechercher un terme utilisé dans InfoBase du GC",
}[lang];

const GlossarySearch = withRouter(
  class GlossarySearch extends React.Component {
    render() {
      const { history } = this.props;

      return (
        <SearchConfigTypeahead
          placeholder={glossary_placeholder}
          search_configs={[glossary_search_config]}
          on_select={({ id }) =>
            history.push(glossary_href(id).replace("#", "/"))
          }
          min_length={2}
        />
      );
    }
);

export { GlossarySearch };
