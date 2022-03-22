import React from "react";
import { withRouter } from "react-router";

import { lang } from "src/core/injected_build_constants";

import { glossary_href } from "src/link_utils";

import { glossary as glossary_search_config } from "src/search/search_configs";
import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

const glossary_placeholder = {
  en: "Search for a term used in GC InfoBase",
  fr: "Rechercher un terme utilisé dans InfoBase du GC",
}[lang];

const GlossarySearch = withRouter(
  class GlossarySearch extends React.Component {
    render() {
      const { history } = this.props;

      return (
        <div>
          <SearchConfigTypeahead
            placeholder={glossary_placeholder}
            search_configs={[glossary_search_config]}
            on_select={({ id }) =>
              history.push(glossary_href(id).replace("#", "/"))
            }
            min_length={2}
          />
        </div>
      );
    }
  }
);

export { GlossarySearch };
