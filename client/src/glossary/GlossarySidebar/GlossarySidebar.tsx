import React from "react";

import "./GlossarySidebar.scss";

import {
  DebouncedTextInput,
  create_text_maker_component,
} from "src/components/index";

import glossary_text from "src/glossary/glossary.yaml";

import { IconSearch } from "src/icons/icons";

import { GlossaryDef } from "./GlossarySidebarDefinition";
import { GlossaryList } from "./GlossarySidebarList";

const { text_maker } = create_text_maker_component(glossary_text);

const GlossarySidebarSearchDefaultProps = {
  placeholder: text_maker("glossary_placeholder"),
};

type GlossarySidebarProps = typeof GlossarySidebarSearchDefaultProps & {
  glossary_item_key: string;
  focus_item_key: string;
  set_glossary_item: (key: string) => void;
  search_phrase: string;
  set_query: (query: string) => void;
};

interface GlossarySidebarState {
  focus_item_key: string;
}

export class GlossarySidebar extends React.Component<
  GlossarySidebarProps,
  GlossarySidebarState
> {
  static defaultProps = GlossarySidebarSearchDefaultProps;

  constructor(props: GlossarySidebarProps) {
    super(props);

    this.state = {
      focus_item_key: "",
    };
  }

  callback = (query: string) => {
    this.props.set_query(query);
    this.props.set_glossary_item("");
  };

  render() {
    const { glossary_item_key, search_phrase, focus_item_key, placeholder } =
      this.props;
    return (
      <div>
        <div className="glossary-sb__header-wrapper">
          <div className="glossary-sb__header">
            <div className="glossary-sb__search-wrapper">
              <div className={"glossary-sb__search-bar"}>
                <div className={"glossary-sb__icon-container"}>
                  <span aria-hidden="true">
                    <IconSearch
                      width="30px"
                      color="#2C70C9"
                      alternate_color={false}
                    />
                  </span>
                </div>
                <DebouncedTextInput
                  placeHolder={placeholder}
                  updateCallback={this.callback}
                  defaultValue={search_phrase}
                />
              </div>
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
                focus_item_key={focus_item_key}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
