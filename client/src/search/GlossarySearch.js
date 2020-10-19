import React from "react";
import { withRouter } from "react-router";

import { lang } from "src/core/injected_build_constants.js";

import { glossary_href } from "../link_utils.js";

import { glossary as glossary_search_config } from "./search_configs.js";

import { Typeahead } from "./Typeahead/Typeahead.js";

const glossary_placeholder = {
  en: "Search for a term used in GC InfoBase",
  fr: "Rechercher un terme utilisé dans InfoBase du GC",
}[lang];

const GlossarySearch = withRouter(
  class GlossarySearch extends React.Component {
    render() {
      const { history } = this.props;

      return (
        <Typeahead
          placeholder={glossary_placeholder}
          search_configs={[glossary_search_config]}
          onSelect={({ id }) =>
            history.push(glossary_href(id).replace("#", "/"))
          }
          minLength={2}
        />
      );
    }
  }
);

export { GlossarySearch };
