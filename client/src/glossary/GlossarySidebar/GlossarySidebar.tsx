import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

import { GlossaryDef } from "./GlossaryDef";
import { GlossaryList } from "./GlossaryList";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossarySidebarProps {
  item: ResultProps;
  open_definition: (key: string) => void;
  show_definition: boolean;
  toggle_definition: (value: boolean) => void;
  results: ResultProps[];
  query: string;
  set_query: (query: string) => void;
  set_results: (data: ResultProps[]) => void;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
  get_compiled_definition: () => string;
}

export class GlossarySidebar extends React.Component<GlossarySidebarProps> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossarySidebarProps) {
    super(props);
  }

  closeDefinition() {
    this.props.toggle_definition(true);
  }

  openItem(key: string) {
    this.props.open_definition(key);
  }

  render() {
    return (
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
                getResults={this.props.set_results}
                setQuery={this.props.set_query}
              />
            </div>
            <div className="glossary-sb__example">
              {text_maker("glossary_example")}
            </div>
          </div>
        </div>
        <div className="glossary-sb__content-wrapper">
          <div className="glossary-sb__content" id="gloss-sidebar">
            {!this.props.show_definition ? (
              <GlossaryDef
                close_definition={() => this.closeDefinition()}
                title={this.props.item.title}
                def={this.props.item.get_compiled_definition()}
              />
            ) : (
              <GlossaryList
                open_definition={(item) => this.openItem(item)}
                query={this.props.query}
                items_by_letter={this.props.results}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
