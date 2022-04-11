import _ from "lodash";
import React from "react";

import "./GlossarySidebar.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { get_glossary_items_by_letter } from "src/glossary/glossary_utils";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { SearchHighlighter } from "src/search/search_utils";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossaryListProps {
  focus_item_key: string;
  open_definition: (key: string) => void;
  search_phrase: string;
}

interface GlossaryListState {
  search_phrase: string;
}

export class GlossaryList extends React.Component<
  GlossaryListProps,
  GlossaryListState
> {
  constructor(props: GlossaryListProps) {
    super(props);

    this.state = {
      search_phrase: "",
    };
  }

  static getDerivedStateFromProps(
    nextProps: GlossaryListProps,
    prevState: GlossaryListState
  ) {
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

  render() {
    const { search_phrase } = this.state;
    const { open_definition } = this.props;

    const results = glossary_search_config.query_sync(search_phrase);

    const items_by_letter = get_glossary_items_by_letter(results);

    return (
      <>
        {results.length === 0 && search_phrase !== "" ? (
          <div>{text_maker("no_matches_found")}</div>
        ) : (
          <div>
            {_.map(items_by_letter, ({ letter, items }) => (
              <section key={letter}>
                <h2 className="glossary-sb__letter">{letter}</h2>
                <hr />
                <ul className={"glossary-sb__list"}>
                  {_.map(items, (item, ix) => (
                    <li key={ix} className="glossary-sb__title">
                      <button
                        id={item.id}
                        onClick={() => open_definition(item.id)}
                        className={"glossary-sb__list-item"}
                        aria-label={text_maker("open_definition") + item.title}
                      >
                        {search_phrase ? (
                          <SearchHighlighter
                            search={search_phrase}
                            content={item.title}
                          />
                        ) : (
                          item.title
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </>
    );
  }
}
