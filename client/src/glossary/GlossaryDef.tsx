import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { lang } from "src/core/injected_build_constants";

import { IconArrow } from "src/icons/icons";

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
    const back_text = {
      en: "Full list",
      fr: "Liste complète",
    }[lang];

    return (
      <div className="glossary-sb-defintion-wrapper">
        <div className="glossary-sb-item-title">{this.props.title}</div>
        <div
          className="glossary-sb-item-def"
          dangerouslySetInnerHTML={{
            __html: this.props.def,
          }}
        />
        <div>
          <span
            role="button"
            className="glossary-sb-back-button"
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
            {back_text}
          </span>
        </div>
      </div>
    );
  }
}
