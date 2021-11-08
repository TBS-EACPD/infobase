import React from "react";

import { get_glossary_item } from "src/models/glossary";
import { GlossaryMenu } from "./GlossaryMenu";

export class SidebarActivator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show_sidebar: true, showGlossary: false, glossaryItem: {} };
  }
  replaceWithModalBtn = (e) => {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }

    const glossary_item_key = target.dataset.ibttGlossaryKey;
    const glossary_item = get_glossary_item(glossary_item_key);

    this.setGlossaryItem(glossary_item);

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

  setGlossaryItem(item) {
    this.setState({ glossaryItem: item });
  }

  render() {
    return (
      <GlossaryMenu
        show={this.state.showGlossary}
        toggle={(value) => this.toggleGlossary(value)}
        item={this.state.glossaryItem}
        setGlossaryItem={(item) => this.setGlossaryItem(item)}
      />
    );
  }
}
