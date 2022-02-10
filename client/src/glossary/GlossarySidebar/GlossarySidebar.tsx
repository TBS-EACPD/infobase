import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { GlossaryDef } from "./GlossarySidebarDefinition";
import { GlossaryList } from "./GlossarySidebarList";
import { SideBarSearch } from "./GlossarySidebarSearch";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossarySidebarProps {
  glossary_item_key: string;
  open_definition: (key: string) => void;
  show_definition: boolean;
  toggle_definition: (value: boolean) => void;
}

interface GlossarySidebarState {
  query: string;
}

export class GlossarySidebar extends React.Component<
  GlossarySidebarProps,
  GlossarySidebarState
> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossarySidebarProps) {
    super(props);

    this.state = {
      query: "",
    };
  }

  closeDefinition() {
    this.props.toggle_definition(true);
  }

  openDefinition(key: string) {
    this.props.open_definition(key);
  }

  setQuery(query: string) {
    this.setState({
      query: query,
    });
  }

  render() {
    const { glossary_item_key } = this.props;
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
              <SideBarSearch setQuery={(query) => this.setQuery(query)} />
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
                glossary_item_key={glossary_item_key}
              />
            ) : (
              <GlossaryList
                open_definition={(key: string) => this.openDefinition(key)}
                search_phrase={this.state.query}
                search_configs={[glossary_search_config]}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
