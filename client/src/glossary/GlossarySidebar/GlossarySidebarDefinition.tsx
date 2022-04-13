import React from "react";

import "./GlossarySidebar.scss";

import {
  create_text_maker_component,
  SidebarContext,
} from "src/components/index";

import { glossaryEntryStore } from "src/models/glossary";

import glossary_text from "src/glossary/glossary.yaml";

import { IconArrow } from "src/icons/icons";

const { text_maker } = create_text_maker_component(glossary_text);

interface SidebarContentProps {
  glossary_item_key: string;
  close_definition: (key: string) => void;
}

export class GlossaryDef extends React.Component<SidebarContentProps> {
  definition_ref = React.createRef<HTMLDivElement>();
  static contextType = SidebarContext;
  constructor(props: SidebarContentProps) {
    super(props);
  }

  componentDidMount() {
    const doneAnimating = this.context.doneAnimating;
    if (doneAnimating) {
      this.definition_ref.current?.focus();
    }
  }

  componentDidUpdate() {
    const doneAnimating = this.context.doneAnimating;
    if (doneAnimating) {
      this.definition_ref.current?.focus();
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
        <div className="glossary-sb__item-title" tabIndex={-1}>
          {title}
        </div>
        <div
          ref={this.definition_ref}
          className="glossary-sb__item-def"
          dangerouslySetInnerHTML={{
            __html: def,
          }}
          tabIndex={-1}
        />
        <div>
          <button
            className="glossary-sb__back-button"
            onClick={() => this.props.close_definition("")}
          >
            <IconArrow
              rotation={180}
              width="25px"
              color="white"
              alternate_color={false}
            />
            {text_maker("return_to_glossary")}
          </button>
        </div>
      </div>
    );
  }
}
