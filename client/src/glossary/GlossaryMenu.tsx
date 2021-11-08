import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { IconX } from "src/icons/icons";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";
import { SearchConfigSidebar } from "src/search/SearchConfigSidebar";

import { SidebarContent } from "./GlossarySidebarContent";

interface GlossaryMenuProps {
  show: boolean;
  toggle: (value: boolean) => void;
  item: GlossaryItem;
  setGlossaryItem: (arg: {}) => void;
}

interface GlossaryMenuState {
  show: boolean;
  results: ResultProps[];
  item: GlossaryItem;
}

export interface GlossaryItem {
  title: string;
  def: string;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
}

export class GlossaryMenu extends React.Component<
  GlossaryMenuProps,
  GlossaryMenuState
> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossaryMenuProps) {
    super(props);

    this.state = {
      show: this.props.show,
      results: [],
      item: this.props.item,
    };
  }

  static getDerivedStateFromProps(
    nextProps: GlossaryMenuProps,
    prevState: GlossaryMenuState
  ) {
    const { show: next_show, item: next_item } = nextProps;
    const { show: prev_show, item: prev_item } = prevState;

    if (next_show !== prev_show) {
      return {
        show: next_show,
      };
    } else if (next_item !== prev_item) {
      return {
        item: next_item,
      };
    } else {
      return null;
    }
  }

  getResults = (childData: ResultProps[]) => {
    this.setState({
      results: childData,
    });
    this.props.setGlossaryItem({});
  };

  closeItem() {
    this.props.setGlossaryItem({});
  }

  openItem(item: Record<string, unknown>) {
    this.props.setGlossaryItem(item);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.toggle(false);
    }
  }

  render() {
    return (
      <div
        className={
          this.state.show
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
                <div className={"close-button"}>
                  <span
                    role="button"
                    className="icon-wrapper"
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
                Glossary
              </h1>
              <div className="search-wrapper">
                <SearchConfigSidebar
                  placeholder={"testing"}
                  search_configs={[glossary_search_config]}
                  getResults={(data: ResultProps[]) => this.getResults(data)}
                />
              </div>
              <div className="glossary-example">
                Example: &quot;Capital Vote&quot;
              </div>
            </div>
          </div>
          <div className="glossary-sidebar-content-wrapper">
            <SidebarContent
              title={this.state.item.title}
              def={this.state.item.def}
              results={this.state.results}
              closeItem={() => this.closeItem()}
              openItem={(item: Record<string, unknown>) => this.openItem(item)}
            />
          </div>
        </aside>
      </div>
    );
  }
}
