import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import { StatelessModal } from "src/components/index";

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
    console.log("\ntarget");
    console.log(target);
    console.dir(_.pickBy(target, (attr) => !!attr && !_.isFunction(attr)));

    const glossary_item_key = target.dataset.ibttGlossaryKey;

    const glossary_def_html = get_glossary_item_tooltip_html(glossary_item_key);

    let glossary_def = document.createElement("div");
    glossary_def.innerHTML = glossary_def_html;
    console.log("glossary_def");
    console.log(glossary_def);
    console.dir(
      _.pickBy(glossary_def, (attr) => !!attr && !_.isFunction(attr))
    );
    // TODO: deal with the modal content
    // console.log("textContent:", glossary_def.textContent);

    const modal = React.createElement(StatelessModal, {
      show: this.state.show_modal,
      body: glossary_def.innerText, // using glossary_def gives an error
      size: "sm",
      //   on_close_callback: () => this.closeModal(),
      on_close_callback: this.closeModal,
    });
    console.log("new child");
    console.log(modal);

    // console.dir(
    //   _.pickBy(
    //     ReactDOM.render(modal, document.createElement("span")),
    //     (attr) => !!attr && !_.isFunction(attr)
    //   )
    // );

    target.removeAttribute("data-ibtt-glossary-key");
    target.removeAttribute("data-toggle");
    target.replaceChildren(
      ReactDOM.render(modal, document.createElement("span"))
    );
  };

  //   closeModal = () => {
  //     console.log("TooltipModalDelegator - closeModal()");
  //     this.setState({ show_modal: false });
  //     console.log(this.state);
  //   };

  closeModal() {
    console.log("toggleModal");
    console.log({ this: this });
    this.setState({ show_modal: false });
  }

  componentDidMount() {
    window.addEventListener("click", this.replaceWithModalBtn);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.replaceWithModalBtn);
  }

  render() {
    console.log("TooltipModalDelegator - render()");
    return this.props.children;
  }
}
