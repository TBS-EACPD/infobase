import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";
import { glossaryEntryStore } from "src/models/glossary";

import { getOperationDefinition } from "@apollo/client/utilities";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SidebarContentProps {
  title: string | null;
  def: string | null;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SidebarContentState {
  defOpen: boolean;
  title: string | null;
  def: string | null;
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

export class SidebarContent extends React.Component<
  SidebarContentProps,
  SidebarContentState
> {
  constructor(props: SidebarContentProps) {
    super(props);

    this.state = {
      defOpen: this.props.title ? true : false,
      title: this.props.title,
      def: this.props.def,
    };
  }

  closeDefinition() {
    this.setState({
      defOpen: false,
    });
  }

  openDefinition(title: string, def: string) {
    this.setState({
      defOpen: true,
      title: title,
      def: def,
    });
  }

  render() {
    const items_by_letter = get_glossary_items_by_letter();
    return (
      <div className="glossary-sidebar-content">
        {this.state.defOpen ? (
          <div className="defintion-wrapper">
            <div className="item-title">{this.state.title}</div>
            <div className="item-def">{this.state.def}</div>
            <div>
              <span
                className="back-button"
                onClick={() => this.closeDefinition()}
              >
                Back
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
                      onClick={() =>
                        this.openDefinition(item.title, item.raw_definition)
                      }
                    >
                      {item.title}
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
