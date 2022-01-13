/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { SearchHighlighter } from "src/search/search_utils";

interface SidebarContentProps {
  open_definition: (key: string) => void;
  query: string;
  items_by_letter: any;
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

export class GlossaryList extends React.Component<
  SidebarContentProps,
  SidebarContentState
> {
  constructor(props: SidebarContentProps) {
    super(props);

    this.state = {
      scrollEl: "",
    };
  }

  componentDidUpdate() {
    if (this.state.scrollEl) {
      const el = document.getElementById(this.state.scrollEl);
      const scrollDiv = document.getElementById("gloss-sidebar");

      if (el && scrollDiv) {
        scrollDiv.scrollTop = el.offsetTop;
        el.focus();
      }
    }
  }

  openDefinition(item: ResultProps) {
    this.props.open_definition(item.id);
    this.setState({
      scrollEl: item.title.replace(/\s+/g, ""),
    });
  }

  //place holder arguments while I get passing functions to work...
  handleKeyPress(
    e: React.KeyboardEvent<HTMLSpanElement>,
    item: ResultProps | null
  ) {
    if (e.key === "Enter" && item) {
      this.openDefinition(item);
    }
  }

  render() {
    const { items_by_letter } = this.props;
    return (
      <div>
        {_.map(items_by_letter, ({ letter, items }) => (
          <div key={letter}>
            <span className="glossary-sb__letter" key={letter}>
              {letter}
            </span>
            <hr />
            {_.map(items, (item, ix) => (
              <div key={ix} className="glossary-sb__title">
                <span
                  role="button"
                  id={item.title.replace(/\s+/g, "")}
                  onClick={() => this.openDefinition(item)}
                  onKeyDown={(e) => this.handleKeyPress(e, item)}
                  tabIndex={0}
                >
                  {this.props.query ? (
                    <SearchHighlighter
                      search={this.props.query}
                      content={item.title}
                    />
                  ) : (
                    item.title
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
