import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import { ModalButton } from "src/components/index";

import { glossaryEntryStore } from "src/models/glossary";

export class TooltipModalDelegator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show_modal: true };
  }
  replaceWithModalBtn = (e) => {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }

    const glossary_item_key = target.dataset.ibttGlossaryKey;

    const glossary_entry = glossaryEntryStore.lookup(glossary_item_key);
    const { title, raw_definition } = glossary_entry;
    console.log({ glossary_entry });

    const modal = React.createElement(ModalButton, {
      title: title,
      body: raw_definition,
      // TODO: link formatting doesnt work (GBA Plus)
      // ** formatting doesn't work (Result Status)
      // link goes off of modal
      // use larger modal size for longer definitions? (Departmental Plan)
    });

    const modal_container = document.createElement("span");
    modal_container.setAttribute("id", "modal_container_span");

    ReactDOM.render(modal, modal_container);

    if (
      !_.pickBy(target.children, (child) => child.id == "modal_container_span")
    ) {
      target.append(modal_container);
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.replaceWithModalBtn);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.replaceWithModalBtn);
  }

  render() {
    // console.log(glossaryEntryStore.get_all());
    return this.props.children;
  }
}
