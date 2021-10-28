import React from "react";

import { get_glossary_item } from "src/models/glossary";

export class SidebarActivator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show_sidebar: true };
  }
  replaceWithModalBtn = (e) => {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }

    const glossary_item_key = target.dataset.ibttGlossaryKey;
    const glossary_item = get_glossary_item(glossary_item_key);

    this.props.setGlossaryItem(glossary_item);

    this.props.toggle(true);
  };

  componentDidMount() {
    window.addEventListener("click", this.replaceWithModalBtn);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.replaceWithModalBtn);
  }

  render() {
    return null;
  }
}
