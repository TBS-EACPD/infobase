import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";
import { glossaryEntryStore } from "src/models/glossary";

import { IconSearch, IconX } from "src/icons/icons";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";
import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

import { SidebarContent } from "./GlossarySidebarContent";

import glossary_text from "./glossary.yaml";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuProps {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuState {
  isOpen: boolean;
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
    };
  }

  closeMenu() {
    this.setState({
      isOpen: false,
    });
  }

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
                <div className="search">
                  <div className="icon-wrapper">
                    <span aria-hidden="true">
                      <IconSearch
                        width="30px"
                        color="#2C70C9"
                        alternate_color={false}
                      />
                    </span>
                  </div>
                  <input
                    placeholder={"Search for a term..."}
                    autoComplete="off"
                    value={""}
                    type="text"
                    role="combobox"
                    aria-autocomplete="none"
                  />
                </div>
              </div>
              <div className="glossary-example">
                Example: &quot;Capital Vote&quot;
              </div>
            </div>
          </div>
          <div className="glossary-sidebar-content-wrapper">
            <SidebarContent title={null} def={null} />
          </div>
        </aside>
      </div>
    );
  }
}
