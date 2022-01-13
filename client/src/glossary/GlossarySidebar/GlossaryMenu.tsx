import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component, Sidebar } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

import { GlossaryDef } from "./GlossaryDef";
import { GlossaryList } from "./GlossaryList";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossaryMenuProps {
  show: boolean;
  toggle: (value: boolean) => void;
  item: ResultProps;
  setGlossaryItem: (key: string) => void;
  showList: boolean;
  setList: (value: boolean) => void;
  results: ResultProps[];
  query: string;
  setQuery: (query: string) => void;
  setResults: (data: ResultProps[]) => void;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
  get_compiled_definition: () => string;
}

export class GlossaryMenu extends React.Component<GlossaryMenuProps> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossaryMenuProps) {
    super(props);
  }

  closeItem() {
    this.props.setList(true);
  }

  openItem(key: string) {
    this.props.setGlossaryItem(key);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.toggle(false);
    }
  }

  render() {
    return (
      <Sidebar
        is_open={this.props.show}
        close_callback={() => this.props.toggle(false)}
        children={
          <div>
            <div className="glossary-sb__header-wrapper" ref={this.header}>
              <div className="glossary-sb__header">
                <h1
                  id="glossary-header"
                  className="glossary-sb__header"
                  tabIndex={-1}
                >
                  {text_maker("glossary_title")}
                </h1>
                <div className="glossary-sb__search-wrapper">
                  <SearchConfigTypeahead
                    type={"glossary-sidebar"}
                    placeholder={text_maker("glossary_placeholder")}
                    search_configs={[glossary_search_config]}
                    getResults={this.props.setResults}
                    setQuery={this.props.setQuery}
                  />
                </div>
                <div className="glossary-sb__example">
                  {text_maker("glossary_example")}
                </div>
              </div>
            </div>
            <div className="glossary-sb__content-wrapper">
              <div className="glossary-sb__content" id="gloss-sidebar">
                {!this.props.showList ? (
                  <GlossaryDef
                    closeItem={() => this.closeItem()}
                    title={this.props.item.title}
                    def={this.props.item.get_compiled_definition()}
                  />
                ) : (
                  <GlossaryList
                    openItem={(item) => this.openItem(item)}
                    query={this.props.query}
                    items_by_letter={this.props.results}
                  />
                )}
              </div>
            </div>
          </div>
        }
      />
    );
  }
}
