/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { lang } from "src/core/injected_build_constants";

import { IconX } from "src/icons/icons";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { MemoSearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

import { GlossaryDef } from "./GlossaryDef";
import { GlossaryList } from "./GlossaryList";

interface GlossaryMenuProps {
  show: boolean;
  toggle: (value: boolean) => void;
  item: ResultProps;
  setGlossaryItem: (key: string) => void;
  showList: boolean;
  setList: (value: boolean) => void;
  results: ResultProps[];
  query: string;
  setQuery: (query: string) => void;
  setResults: (data: ResultProps[]) => void;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
  get_compiled_definition: () => string;
}

export class GlossaryMenu extends React.Component<GlossaryMenuProps> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossaryMenuProps) {
    super(props);
  }

  closeItem() {
    this.props.setList(true);
  }

  openItem(key: string) {
    this.props.setGlossaryItem(key);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.toggle(false);
    }
  }

  render() {
    const glossary_placeholder = {
      en: "Search for a term",
      fr: "Rechercher un terme",
    }[lang];

    const glossary_example = {
      en: 'Example: "Expenditures"',
      fr: 'Exemple: "Dépenses"',
    }[lang];

    const glossary_title = {
      en: "Glossary",
      fr: "Glossaire",
    }[lang];

    return (
      <div
        className={
          this.props.show
            ? "glossary-sidebar-wrapper active"
            : "glossary-sidebar-wrapper"
        }
      >
        <aside
          role="dialog"
          aria-labelledby="glossary-header"
          className="glossary-sidebar"
          ref={this.main}
        >
          <div className="glossary-sidebar-header-wrapper" ref={this.header}>
            <div className="glossary-sidebar-header">
              <div role="navigation" aria-label="Glossary navigation">
                <div className={"glossary-sb-close-button"}>
                  <span
                    role="button"
                    className="glossary-sb-icon-wrapper"
                    onClick={() => this.props.toggle(false)}
                    onKeyDown={(e) => this.handleKeyPress(e)}
                    tabIndex={0}
                  >
                    <IconX width="25px" color="white" alternate_color={false} />
                  </span>
                </div>
              </div>
              <h1
                id="glossary-header"
                className="glossary-header"
                tabIndex={-1}
              >
                {glossary_title}
              </h1>
              <div className="glossary-sb-search-wrapper">
                <MemoSearchConfigTypeahead
                  type={"glossary-sidebar"}
                  placeholder={glossary_placeholder}
                  search_configs={[glossary_search_config]}
                  getResults={this.props.setResults}
                  setQuery={this.props.setQuery}
                />
              </div>
              <div className="glossary-sb-example">{glossary_example}</div>
            </div>
          </div>
          <div className="glossary-sidebar-content-wrapper">
            <div className="glossary-sidebar-content" id="gloss-sidebar">
              {!this.props.showList ? (
                <GlossaryDef
                  closeItem={() => this.closeItem()}
                  title={this.props.item.title}
                  def={this.props.item.get_compiled_definition()}
                />
              ) : (
                <GlossaryList
                  openItem={(item) => this.openItem(item)}
                  query={this.props.query}
                  items_by_letter={this.props.results}
                />
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }
}
