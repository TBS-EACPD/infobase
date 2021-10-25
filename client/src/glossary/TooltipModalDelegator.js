import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import { ModalButton } from "src/components/index";

import { get_glossary_item_tooltip_html } from "src/models/glossary";

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

    const glossary_def_html_str =
      get_glossary_item_tooltip_html(glossary_item_key).trim();

    let glossary_def = document.createElement("div");
    glossary_def.innerHTML = glossary_def_html_str;

    const modal = React.createElement(ModalButton, {
      body: glossary_def.innerText, // using glossary_def gives an error TODO: deal with modal body
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
    return this.props.children;
  }
}
