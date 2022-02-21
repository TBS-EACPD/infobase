import _ from "lodash";
import React from "react";

import "./GlossarySidebar.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { get_glossary_items_by_letter } from "src/glossary/glossary_utils";

import {
  glossary_lite,
  glossary_lite as glossary_search_config,
} from "src/search/search_configs";

import {
  SearchHighlighter,
  get_simplified_search_phrase,
} from "src/search/search_utils";

const { text_maker } = create_text_maker_component(glossary_text);

export class GlossaryList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_phrase: "",
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { search_phrase: next_phrase } = nextProps;
    const { search_phrase: prev_phrase } = prevState;

    if (next_phrase !== prev_phrase) {
      return {
        search_phrase: next_phrase,
      };
    } else {
      return null;
    }
  }

  componentDidMount() {
    document.getElementById(this.props.focus_item_key)?.focus();
  }

  openDefinition(item) {
    this.props.open_definition(item.id);
  }

  handleKeyPress(e, item) {
    if (e.key === "Enter" && item) {
      this.openDefinition(item);
    }
  }

  render() {
    const { search_phrase } = this.state;

    const results = glossary_lite.query_sync(search_phrase);

    const items_by_letter = get_glossary_items_by_letter(results);

    return (
      <div>
        {results.length == 0 && search_phrase != "" ? (
          <div>{text_maker("no_matches_found")}</div>
        ) : (
          <div>
            {_.map(items_by_letter, ({ letter, items }) => (
              <div key={letter}>
                <span className="glossary-sb__letter" key={letter}>
                  {letter}
                </span>
                <hr />
                {_.map(items, (item, ix) => (
                  <div key={ix} className="glossary-sb__title">
                    <span
                      role="button"
                      id={item.id}
                      onClick={() => this.openDefinition(item)}
                      onKeyDown={(e) => this.handleKeyPress(e, item)}
                      tabIndex={0}
                    >
                      {search_phrase ? (
                        <SearchHighlighter
                          search={search_phrase}
                          content={item.title}
                        />
                      ) : (
                        item.title
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
