import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";
import { glossaryEntryStore } from "src/models/glossary";

import { lang } from "src/core/injected_build_constants";

import { IconArrow } from "src/icons/icons";
import { InfoBaseHighlighter } from "src/search/search_utils";

interface SidebarContentProps {
  title: string | null;
  def: string | null;
  results: ResultProps[];
  closeItem: () => void;
  openItem: (key: string) => void;
  showList: boolean;
  query: string;
}

interface SidebarContentState {
  title: string | null;
  def: string | "";
  scrollEl: string;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
}

export class SidebarContent extends React.Component<
  SidebarContentProps,
  SidebarContentState
> {
  listRef = React.createRef<HTMLDivElement>();
  constructor(props: SidebarContentProps) {
    super(props);

    this.state = {
      title: null,
      def: "",
      scrollEl: "",
    };
  }

  static getDerivedStateFromProps(
    nextProps: SidebarContentProps,
    prevState: SidebarContentState
  ) {
    const { title: next_title, def: next_def } = nextProps;
    const { title: prev_title } = prevState;

    if (next_title !== prev_title) {
      return {
        title: next_title,
        def: next_def,
      };
    } else {
      return null;
    }
  }

  closeDefinition() {
    this.props.closeItem();
    if (this.state.title) {
      this.setState({
        scrollEl: this.state.title.replace(/\s+/g, ""),
      });
    }
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
    this.props.openItem(item.id);
    this.setState({
      scrollEl: item.title.replace(/\s+/g, ""),
    });
  }

  //place holder arguments while I get passing functions to work...
  handleKeyPress(
    e: React.KeyboardEvent<HTMLSpanElement>,
    action: string,
    item: ResultProps | null
  ) {
    if (e.key === "Enter") {
      switch (action) {
        case "close":
          this.closeDefinition();
          break;

        case "open":
          if (item) {
            this.openDefinition(item);
          }
          break;
      }
    }
  }

  get_glossary_items_by_letter() {
    const glossary_items =
      this.props.results.length == 0
        ? glossaryEntryStore.get_all()
        : this.props.results;

    const glossary_items_by_letter = _.chain(glossary_items)
      .groupBy((item) => {
        const first_letter = item.title[0];
        if (_.includes(["É", "È", "Ê", "Ë"], first_letter)) {
          return "E";
        }
        return first_letter;
      })
      .map((items, letter) => {
        const sorted_items = _.sortBy(items, "title");
        return {
          items: sorted_items,
          letter,
        };
      })
      .sortBy("letter")
      .value();
    return glossary_items_by_letter;
  }

  render() {
    const back_text = {
      en: "Full list",
      fr: "Liste complète",
    }[lang];

    const items_by_letter = this.get_glossary_items_by_letter();
    return (
      <div className="glossary-sidebar-content" id="gloss-sidebar">
        {!this.props.showList ? (
          <div className="defintion-wrapper">
            <div className="item-title">{this.state.title}</div>
            <div
              className="item-def"
              dangerouslySetInnerHTML={{
                __html: this.state.def,
              }}
            />
            <div>
              <span
                role="button"
                className="back-button"
                onClick={() => this.closeDefinition()}
                onKeyDown={(e) => this.handleKeyPress(e, "close", null)}
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
        ) : (
          <div>
            {_.map(items_by_letter, ({ letter, items }) => (
              <div key={letter}>
                <span className="glossary-letter" key={letter}>
                  {letter}
                </span>
                <hr />
                {_.map(items, (item, ix) => (
                  <div key={ix} className="glossary-title">
                    <span
                      role="button"
                      id={item.title.replace(/\s+/g, "")}
                      onClick={() => this.openDefinition(item)}
                      onKeyDown={(e) => this.handleKeyPress(e, "open", item)}
                      tabIndex={0}
                    >
                      <InfoBaseHighlighter
                        search={this.props.query}
                        content={item.title}
                      />
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
