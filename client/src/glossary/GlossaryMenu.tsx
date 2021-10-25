import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { IconX } from "src/icons/icons";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";
import { SearchConfigSidebar } from "src/search/SearchConfigSidebar";

import { SidebarContent } from "./GlossarySidebarContent";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuProps {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuState {
  isOpen: boolean;
  results: ResultProps[];
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
      isOpen: true,
      results: [],
    };
  }

  closeMenu() {
    this.setState({
      isOpen: false,
    });
  }

  getResults = (childData: ResultProps[]) => {
    this.setState({
      results: childData,
    });
  };

  render() {
    return (
      <div
        className={
          this.state.isOpen
            ? "glossary-sidebar-wrapper active"
            : "glossary-sidebar-wrapper"
        }
      >
        <aside
          role="dialog"
          aria-labelledby="glossary-title"
          className="glossary-sidebar"
          ref={this.main}
        >
          <div className="glossary-sidebar-header-wrapper" ref={this.header}>
            <div className="glossary-sidebar-header">
              <div role="navigation" aria-label="Glossary navigation">
                <div className={"close-button"}>
                  <span className="icon" onClick={() => this.closeMenu()}>
                    <IconX width="25px" color="white" alternate_color={false} />
                  </span>
                </div>
              </div>
              <h1 id="glossary-title" className="glossary-title" tabIndex={-1}>
                Glossary
              </h1>
              <div className="search-wrapper">
                <SearchConfigSidebar
                  placeholder={"testing"}
                  search_configs={[glossary_search_config]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              title={null}
              def={null}
              results={this.state.results}
            />
          </div>
        </aside>
      </div>
    );
  }
}
