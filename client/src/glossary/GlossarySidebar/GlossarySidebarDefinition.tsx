import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component } from "src/components/index";

import { glossaryEntryStore } from "src/models/glossary";

import glossary_text from "src/glossary/glossary.yaml";

import { IconArrow } from "src/icons/icons";

const { text_maker } = create_text_maker_component(glossary_text);

interface SidebarContentProps {
  glossary_item_key: string;
  close_definition: () => void;
}

interface SidebarContentState {
  scrollEl: string;
}

export class GlossaryDef extends React.Component<
  SidebarContentProps,
  SidebarContentState
> {
  constructor(props: SidebarContentProps) {
    super(props);

    this.state = {
      scrollEl: "",
    };
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.close_definition();
    }
  }

  render() {
    const glossary_item = glossaryEntryStore.lookup(
      this.props.glossary_item_key
    );
    const def = glossary_item.get_compiled_definition();
    const title = glossary_item.title;

    return (
      <div className="glossary-sb__defintion-wrapper">
        <div className="glossary-sb__item-title">{title}</div>
        <div
          className="glossary-sb__item-def"
          dangerouslySetInnerHTML={{
            __html: def,
          }}
        />
        <div>
          <span
            role="button"
            className="glossary-sb__back-button"
            onClick={() => this.props.close_definition()}
            onKeyDown={(e) => this.handleKeyPress(e)}
            tabIndex={0}
          >
            <IconArrow
              rotation={180}
              width="25px"
              color="white"
              alternate_color={false}
            />
            {text_maker("back_text")}
          </span>
        </div>
      </div>
    );
  }
}
