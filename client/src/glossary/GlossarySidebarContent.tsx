import React from "react";

import "./GlossaryMenu.scss";

import { GlossaryDef } from "./GlossaryDef";
import { GlossaryList } from "./GlossaryList";

interface SidebarContentProps {
  title: string;
  def: string;
  results: ResultProps[];
  closeItem: () => void;
  openItem: (key: string) => void;
  showList: boolean;
  query: string;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
}

export class SidebarContent extends React.Component<SidebarContentProps> {
  constructor(props: SidebarContentProps) {
    super(props);
  }

  render() {
    return (
      <div className="glossary-sb__content" id="gloss-sidebar">
        {!this.props.showList ? (
          <GlossaryDef
            closeItem={this.props.closeItem}
            title={this.props.title}
            def={this.props.def}
          />
        ) : (
          <GlossaryList
            openItem={this.props.openItem}
            query={this.props.query}
            items_by_letter={this.props.results}
          />
        )}
      </div>
    );
  }
}
