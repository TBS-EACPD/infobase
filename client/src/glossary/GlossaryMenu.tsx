import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";
import { glossaryEntryStore } from "src/models/glossary";

import { IconSearch, IconX } from "src/icons/icons";

import glossary_text from "./glossary.yaml";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuProps {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlossaryMenuState {
  isOpen: boolean;
}

function get_glossary_items_by_letter() {
  const glossary_items = glossaryEntryStore.get_all();

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
    const items_by_letter = get_glossary_items_by_letter();
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
            <div className="glossary-sidebar-content">
              {_.map(items_by_letter, ({ letter, items }) => (
                <div>
                  <span className="glossary-letter" key={letter}>
                    {letter}
                  </span>
                  <hr />
                  {_.map(items, (item, ix) => (
                    <div key={ix} className="glossary-title">
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }
}
