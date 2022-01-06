import React from "react";

import "./GlossaryMenu.scss";

import { create_text_maker_component } from "src/components/index";

import { IconArrow } from "src/icons/icons";

import glossary_text from "./glossary.yaml";

const { text_maker } = create_text_maker_component(glossary_text);

interface SidebarContentProps {
  title: string;
  def: string;
  closeItem: () => void;
}

interface SidebarContentState {
  scrollEl: string;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
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
      this.props.closeItem();
    }
  }

  render() {
    return (
      <div className="glossary-sb__defintion-wrapper">
        <div className="glossary-sb__item-title">{this.props.title}</div>
        <div
          className="glossary-sb__item-def"
          dangerouslySetInnerHTML={{
            __html: this.props.def,
          }}
        />
        <div>
          <span
            role="button"
            className="glossary-sb__back-button"
            onClick={() => this.props.closeItem()}
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
