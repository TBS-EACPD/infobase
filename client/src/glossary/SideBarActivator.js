import React from "react";

import { glossaryEntryStore } from "src/models/glossary";

import { BackToTop } from "src/components";

import { GlossaryMenu } from "./GlossaryMenu";

export class SidebarActivator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_sidebar: true,
      showGlossary: false,
      glossaryItem: {},
      showList: true,
    };
  }
  replaceWithModalBtn = (e) => {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip"
        ? e.target
        : e.target.parentElement.getAttribute("data-toggle") === "tooltip"
        ? e.target.parentElement
        : undefined;

    if (!target) {
      return;
    }

    const glossary_item_key = target.dataset.ibttGlossaryKey;
    const glossary_item = glossaryEntryStore.lookup(glossary_item_key);

    this.setGlossaryItem(glossary_item.id);
    this.showList(false);

    this.toggleGlossary(true);
  };

  componentDidMount() {
    window.addEventListener("click", this.replaceWithModalBtn);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.replaceWithModalBtn);
  }

  toggleGlossary(value) {
    this.setState({
      showGlossary: value,
    });
  }

  setGlossaryItem(key) {
    this.setState({
      glossaryItem: glossaryEntryStore.lookup(key),
      showList: false,
    });
  }

  showList(value) {
    this.setState({
      showList: value,
    });
  }
  render() {
    return (
      <div>
        <GlossaryMenu
          show={this.state.showGlossary}
          toggle={(value) => this.toggleGlossary(value)}
          item={this.state.glossaryItem}
          setGlossaryItem={(key) => this.setGlossaryItem(key)}
          showList={this.state.showList}
          setList={(value) => this.showList(value)}
        />
        <BackToTop
          focus={() => {
            document.querySelector(".glossary__search-bar > input").focus();
          }}
          handleClick={() => {
            this.setState({ showGlossary: true });
          }}
          text={"glossary_button"}
        />
      </div>
    );
  }
}
