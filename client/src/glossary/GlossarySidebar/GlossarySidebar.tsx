import React from "react";

import "./GlossarySidebar.scss";

import { create_text_maker_component } from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { GlossaryDef } from "./GlossarySidebarDefinition";
import { GlossaryList } from "./GlossarySidebarList";
import { SideBarSearch } from "./GlossarySidebarSearch";

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossarySidebarProps {
  glossary_item_key: string;
  focus_item_key: string;
  set_glossary_item: (key: string) => void;
  search_phrase: string;
  set_query: (query: string) => void;
}

interface GlossarySidebarState {
  focus_item_key: string;
}

export class GlossarySidebar extends React.Component<
  GlossarySidebarProps,
  GlossarySidebarState
> {
  constructor(props: GlossarySidebarProps) {
    super(props);

    this.state = {
      focus_item_key: "",
    };
  }

  render() {
    const { glossary_item_key, search_phrase, focus_item_key } = this.props;
    return (
      <div>
        <div className="glossary-sb__header-wrapper">
          <div className="glossary-sb__header">
            <div className="glossary-sb__search-wrapper">
              <SideBarSearch
                set_glossary_item={(key) => this.props.set_glossary_item(key)}
                setQuery={(query) => this.props.set_query(query)}
                search_phrase={search_phrase}
              />
            </div>
            <div className="glossary-sb__example">
              {text_maker("glossary_example")}
            </div>
          </div>
        </div>
        <div className="glossary-sb__content-wrapper">
          <div className="glossary-sb__content" id="gloss-sidebar">
            {glossary_item_key ? (
              <GlossaryDef
                close_definition={() => this.props.set_glossary_item("")}
                glossary_item_key={glossary_item_key}
              />
            ) : (
              <GlossaryList
                open_definition={(key: string) =>
                  this.props.set_glossary_item(key)
                }
                search_phrase={search_phrase}
                search_configs={[glossary_search_config]}
                focus_item_key={focus_item_key}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
