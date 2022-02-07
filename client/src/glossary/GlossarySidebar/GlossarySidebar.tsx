import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { GlossaryDef } from "./GlossaryDef";
import { GlossaryList } from "./GlossaryList";
import { SideBarSearch } from "./SideBarSearch";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossarySidebarProps {
  item: ResultProps;
  open_definition: (key: string) => void;
  show_definition: boolean;
  toggle_definition: (value: boolean) => void;
}

interface GlossarySidebarState {
  query: string;
}

export interface ResultProps {
  id: string;
  title: string;
  get_compiled_definition: () => string;
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

  openItem(key: string) {
    this.props.open_definition(key);
  }

  setQuery(query: string) {
    this.setState({
      query: query,
    });
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
                title={this.props.item.title}
                def={this.props.item.get_compiled_definition()}
              />
            ) : (
              <GlossaryList
                open_definition={(item: string) => this.openItem(item)}
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
